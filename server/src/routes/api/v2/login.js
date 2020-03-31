const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const smsProvider = require('@utils/smsProvider')
const { getAdmin } = require('@services/firebase')

const secret = config.get('api.secret')
const expiresIn = config.get('api.tokenExpiresIn')

/**
 * @api {post} api/v2/login/request Request a verification code
 * @apiName Request
 * @apiGroup Login
 * @apiDescription Request a verification code to user's phone number
 *
 * @apiParam {String} phoneNumber User phone number
 *
 * @apiSuccess {String} response Response status - ok
 */
router.post('/request', async (req, res) => {
  const { phoneNumber } = req.body

  try {
    await smsProvider.verify({ phoneNumber })
    res.json({ response: 'ok' })
  } catch (e) {
    console.error('Got an error from sms provider:', e.code, e.message)
    res.status(400).json({ error: e.message })
  }
})

/**
 * @api {post} api/v2/login/verify Verify user phone number
 * @apiName Verify
 * @apiGroup Login
 * @apiDescription Verify user phone number by SMS verification code
 *
 * @apiParam {String} phoneNumber User phone number
 * @apiParam {String} accountAddress User account address
 * @apiParam {String} code SMS code recieved to user phone number
 *
 * @apiSuccess {String} token JWT token
 */
router.post('/verify', async (req, res) => {
  const { phoneNumber, accountAddress, code } = req.body

  const response = await smsProvider.verifyCheck({ phoneNumber, code })

  if (response.status === 'approved') {
    const token = jwt.sign({ phoneNumber, accountAddress }, secret, {
      expiresIn
    })
    res.json({ token })
  } else {
    res.status(400).json({ error: 'Wrong SMS code' })
  }
})

/**
 * @api {post} api/v2/login/ Login using firebase ID token
 * @apiName Login
 * @apiGroup Login
 * @apiDescription Login using firebase ID token
 *
 * @apiParam {String} accountAddress User account address
 * @apiParam {String} token Firebase ID token
 *
 * @apiSuccess {String} token JWT token
 */
router.post('/', async (req, res) => {
  const { accountAddress, token, identifier, appName } = req.body
  const manager = getAdmin(appName)
  manager.auth().verifyIdToken(token)
    .then(decodedToken => {
      const data = { phoneNumber: decodedToken.phone_number, accountAddress, uid: decodedToken.uid, appName }
      if (identifier) {
        data.identifier = identifier
      }
      const token = jwt.sign(data, secret, { expiresIn })
      res.json({ token })
    }).catch(err => {
      console.error('Login error', err)
      res.status(400).json({ error: 'Login failed' })
    })
})

const request = require('request-promise-native')
const mongoose = require('mongoose')
const User = mongoose.model('User')

router.post('/google', async (req, res) => {
  const { tokenId } = req.body
  const { email, aud, sub, name } = await request.get(
    `/tokeninfo?id_token=${tokenId}&scope=profile`,
    { baseUrl: config.get('api.auth.google.baseUrl'), json: true })
  if (aud !== config.get('api.auth.google.clientId')) {
    console.warn(`Wrong token aud for token id ${tokenId}`)
    return res.send({
      error: 'Wrong token aud'
    }).status(400)
  }

  let user = await User.findOne({ externalId: sub })

  if (!user) {
    user = await User({ email, externalId: sub, displayName: name, source: 'studio' }).save()
  }

  const token = jwt.sign({ email, id: user._id }, secret, {
    expiresIn
  })
  res.json({ token })
})

module.exports = router
