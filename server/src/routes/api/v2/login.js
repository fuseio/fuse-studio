const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const twilio = require('@utils/twilio')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

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

  const isMagic = (config.get('env') === 'qa' && phoneNumber.endsWith(config.get('twilio.magic')))
  const isTeam = config.has('phoneNumbers.team') ? config.get('phoneNumbers.team').split(',').includes(phoneNumber) : false
  const numberOfWallets = await UserWallet.find({ phoneNumber }).countDocuments()

  if (!isMagic && !isTeam && numberOfWallets > config.get('phoneNumbers.maxUserWallets')) {
    return res.status(400).json({ error: 'Too many wallets...' })
  }
  try {
    await twilio.verify({ phoneNumber })
    res.json({ response: 'ok' })
  } catch (e) {
    console.error('Got an error from Twilio:', e.code, e.message)
    res.status(400).json({ error: e.message })
  }
})

/**
 * @api {post} api/v2/login/verify Verify user phone number
 * @apiName Veify
 * @apiGroup Login
 * @apiDescription Verify user phone number by SMS verification code
 *
 * @apiParam {String} phoneNumber User phone number
 * @apiParam {accountAddress} User account address
 * @apiParam {String} code SMS code recieved to user phone number
 *
 * @apiSuccess {String} token JWT token
 */
router.post('/verify', async (req, res) => {
  const { phoneNumber, accountAddress, code } = req.body

  const response = await twilio.verifyCheck({ phoneNumber, code })

  if (response.status === 'approved') {
    const secret = config.get('api.secret')
    const expiresIn = config.get('api.tokenExpiresIn')

    const token = jwt.sign({ phoneNumber, accountAddress }, secret, {
      expiresIn
    })
    res.json({ token })
  } else {
    res.status(400).json({ error: 'Wrong SMS code' })
  }
})

module.exports = router
