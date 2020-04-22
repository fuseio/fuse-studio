const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { createAccountWithRole } = require('@utils/account')
const smsProvider = require('@utils/smsProvider')
const { getAdmin } = require('@services/firebase')
const { OAuth2Client } = require('google-auth-library')

const clientId = config.get('api.auth.google.clientId')
const secret = config.get('api.secret')
const expiresIn = config.get('api.tokenExpiresIn')

const User = mongoose.model('User')
const client = new OAuth2Client(clientId)

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

router.post('/google', async (req, res) => {
  const { tokenId } = req.body

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: clientId
  })

  const { email, sub, name } = ticket.getPayload()
  let user = await User.findOne({ externalId: sub })

  if (!user) {
    const { accountId, accountAddress } = await createAccountWithRole('communityAdmin')
    user = await User({ email, accountId, accountAddress, source: 'studio', displayName: name, externalId: sub }).save()
  }

  if (!user.accountId) {
    const { accountId, accountAddress } = await createAccountWithRole('communityAdmin')
    user = await User.findOneAndUpdate({ externalId: sub }, { accountId, accountAddress })
  }

  const token = jwt.sign({ email, id: user._id, accountAddress: user.accountAddress }, secret, { expiresIn })
  res.json({ token })
})

module.exports = router
