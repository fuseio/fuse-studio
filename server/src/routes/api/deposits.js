const router = require('express').Router()
const { makeDeposit } = require('@utils/deposit')
const config = require('config')
const web3Utils = require('web3-utils')
const crypto = require('crypto')

const moonpayAuthCheck = (req, res, next) => {
  const sigHeader = req.header('Moonpay-Signature')
  const [timestampPart, sigPart] = sigHeader.split(',')
  const timestamp = timestampPart.split('t=')[1]
  const sig = sigPart.split('s=')[1]
  const signedPayload = timestamp + '.' + JSON.stringify(req.body)
  const computedSig = crypto.createHmac('sha256', config.get('moonpay.webhook.secret')).update(signedPayload).digest('hex')
  if (computedSig === sig) {
    return next()
  } else {
    throw Error('Invalid moonpay signature')
  }
}

router.post('/moonpay', moonpayAuthCheck, async (req, res) => {
  const { status, walletAddress, baseCurrencyAmount } = req.body.data
  const { type } = req.body
  const currencies = config.get('moonpay.currencies')
  if (type === 'transaction_updated' && status === 'completed') {
    const { currencyId, cryptoTransactionId } = req.body.data
    const { externalCustomerId } = req.body
    const foreignTokenAddress = currencies[currencyId]
    if (!foreignTokenAddress) {
      throw new Error(`The currency type ${currencyId} is not supported. Cannot process transaction ${cryptoTransactionId} from account ${externalCustomerId}`)
    }
    await makeDeposit({
      walletAddress,
      customerAddress: externalCustomerId,
      foreignTokenAddress,
      amount: web3Utils.toWei(String(baseCurrencyAmount))
    })
    return res.json({ response: 'job started' })
  } else {
    return res.json({})
  }
})

module.exports = router
