const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const smsProvider = require('@utils/smsProvider')
const { verifyWalletOwner } = require('@utils/login')

/**
 * @api {post} api/v2/login/wallet/sms/request Request a verification code
 * @apiName RequestSMS
 * @apiGroup WalletLogin
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
 * @api {post} api/v2/login/wallet/sms/verify Verify user phone number
 * @apiName VerifySMS
 * @apiGroup WalletLogin
 * @apiDescription Verify user phone number by SMS verification code
 *
 * @apiParam {String} phoneNumber User phone number
 * @apiParam {String} accountAddress User account address
 * @apiParam {String} code SMS code received to user phone number
 *
 * @apiSuccess {String} token JWT token
 */
router.post('/verify', async (req, res) => {
  const { phoneNumber, accountAddress, code, appName } = req.body

  if (await verifyWalletOwner({ phoneNumber, accountAddress })) {
    const response = await smsProvider.verifyCheck({ phoneNumber, code })
    if (response.status === 'approved') {
      const secret = config.get('api.secret')
      const token = jwt.sign({ phoneNumber, accountAddress, appName, verifiedBy: 'sms' }, secret)
      res.json({ token })
    } else {
      res.status(400).json({ error: 'Wrong SMS code' })
    }
  } else {
    res.status(403).json({ error: 'This account is registered to another phone, Please contact support to update your phone number' })
  }
})

module.exports = router
