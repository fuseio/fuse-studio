const router = require('express').Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { verifyWalletOwner } = require('@utils/login')

router.use('/firebase', require('./firebase'))
router.use('/sms', require('./sms'))

/**
 * @api {post} api/v2/login/wallet/request Request a verification code
 * @apiName SimpleRequest
 * @apiGroup WalletLogin
 * @apiDescription Request a verification code to user's phone number
 *
 * @apiParam {String} accountAddress User account address
 * @apiParam {String} phoneNumber User phone number

 *
 * @apiSuccess {String} response Response status - ok
 */
router.post('/request', async (req, res) => {
  const { accountAddress, phoneNumber, appName } = req.body
  const secret = config.get('api.secret')
  if (await verifyWalletOwner({ phoneNumber, accountAddress })) {
    const token = jwt.sign({ phoneNumber, accountAddress, appName }, secret)
    res.json({ token })
  } else {
    res.status(403).json({ error: 'This account is registered to another phone, Please contact support to update your phone number' })
  }
})
module.exports = router
