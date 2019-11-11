const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')

const client = require('twilio')(config.get('twilio.accountSid'), config.get('twilio.authToken'))

/**
 * @api {post} /login/request Request a verification code
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
    await client.verify.services(config.get('twilio.serviceSid'))
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      })

    res.json({ response: 'ok' })
  } catch (e) {
    console.error('Got an error from Twilio:', e.code, e.message)
    res.status(400).json({ error: e.message })
  }
})

/**
 * @api {post} /login/verify Verify user phone number
 * @apiName Veify
 * @apiGroup Login
 * @apiDescription Verify user phone number by SMS verification code
 *
 * @apiParam {String} phoneNumber User phone number
 * @apiParam {String} code SMS code recieved to user phone number
 *
 * @apiSuccess {String} token JWT token
 */
router.post('/verify', async (req, res) => {
  const { phoneNumber, code } = req.body

  const response = await client.verify.services(config.get('twilio.serviceSid'))
    .verificationChecks
    .create({
      to: phoneNumber,
      code
    })

  if (response.status === 'approved') {
    const secret = config.get('api.secret')
    const expiresIn = config.get('api.tokenExpiresIn')

    const token = jwt.sign({ phoneNumber }, secret, {
      expiresIn
    })
    res.json({ token })
  } else {
    res.status(400).json({ error: 'Wrong SMS code' })
  }
})

module.exports = router
