const router = require('express').Router()
const { makeDeposit } = require('@utils/deposit')
const config = require('config')
const web3Utils = require('web3-utils')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const request = require('request-promise-native')

const moonpayAuthCheck = (req, res, next) => {
  const sigHeader = req.header('Moonpay-Signature')
  const [timestampPart, sigPart] = sigHeader.split(',')
  const timestamp = timestampPart.split('t=')[1]
  const sig = sigPart.split('s=')[1]
  const signedPayload = timestamp + '.' + JSON.stringify(req.body)
  const computedSig = crypto.createHmac('sha256', config.get('plugins.moonpay.webhook.secret')).update(signedPayload).digest('hex')
  if (computedSig === sig) {
    return next()
  } else {
    throw Error('Invalid moonpay signature')
  }
}

const transakAuthCheck = (req, res, next) => {
  try {
    if (!req.body || !req.body.data) {
      throw new Error('Transak auth check failed - no data')
    }
    req.body.data = jwt.verify(req.body.data, config.get('plugins.transak.api.secret'))
    return next()
  } catch (err) {
    throw new Error(`Transak auth check failed - ${err}`)
  }
}

router.post('/moonpay', moonpayAuthCheck, async (req, res) => {
  const { status } = req.body.data
  const { type } = req.body
  const currencies = config.get('plugins.moonpay.currencies')
  if (type === 'transaction_updated' && status === 'completed') {
    const { currencyId, cryptoTransactionId, baseCurrencyAmount, walletAddress, id } = req.body.data
    const { externalCustomerId } = req.body
    const tokenAddress = currencies[currencyId]
    if (!tokenAddress) {
      throw new Error(`The currency type ${currencyId} is not supported. Cannot process transaction ${cryptoTransactionId} from account ${externalCustomerId}`)
    }
    await makeDeposit({
      transactionHash: cryptoTransactionId,
      walletAddress,
      customerAddress: externalCustomerId,
      tokenAddress,
      amount: web3Utils.toWei(String(baseCurrencyAmount)),
      externalId: id,
      provider: 'moonpay'
    })
    return res.json({ response: 'job started' })
  } else {
    return res.json({})
  }
})

router.post('/transak', transakAuthCheck, async (req, res) => {
  const { eventID, webhookData } = req.body.data
  if (eventID === 'ORDER_COMPLETED' && webhookData.status === 'COMPLETED') {
    const { id, walletAddress, transactionHash, partnerCustomerId, cryptoAmount, cryptocurrency } = webhookData
    try {
      const filter = encodeURIComponent(`{"where":{"symbol":"${cryptocurrency}"}}`)
      const url = `${config.get('plugins.transak.api.urlBase')}/crypto-currencies?filter=${filter}`
      const response = await request.get(url)
      const cryptoCurrencyData = JSON.parse(response)
      await makeDeposit({
        transactionHash,
        walletAddress,
        customerAddress: partnerCustomerId,
        tokenAddress: cryptoCurrencyData.address,
        amount: web3Utils.toWei(String(cryptoAmount)),
        externalId: id,
        provider: 'transak'
      })
      return res.json({ response: 'job started' })
    } catch (err) {
      console.error(`Transak deposit failed`, err)
    }
  } else {
    return res.json({})
  }
})

module.exports = router
