const router = require('express').Router()
const { makeDeposit } = require('@utils/deposit')
const config = require('config')
const web3Utils = require('web3-utils')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const request = require('request-promise-native')
const stableStringify = require('fast-json-stable-stringify')

const moonpayAuthCheck = (req, res, next) => {
  console.log(`[deposit-moonpayAuthCheck]`)
  const sigHeader = req.header('Moonpay-Signature')
  console.log(`[deposit-moonpayAuthCheck] sigHeader: ${sigHeader}`)
  const [timestampPart, sigPart] = sigHeader.split(',')
  console.log(`[deposit-moonpayAuthCheck] timestampPart: ${timestampPart}, sigPart: ${sigPart}`)
  const timestamp = timestampPart.split('t=')[1]
  console.log(`[deposit-moonpayAuthCheck] timestamp: ${timestamp}`)
  const sig = sigPart.split('s=')[1]
  console.log(`[deposit-moonpayAuthCheck] sig: ${sig}`)
  const signedPayload = timestamp + '.' + JSON.stringify(req.body)
  console.log(`[deposit-moonpayAuthCheck] signedPayload: ${signedPayload}`)
  const computedSig = crypto.createHmac('sha256', config.get('plugins.moonpay.webhook.secret')).update(signedPayload).digest('hex')
  console.log(`[deposit-moonpayAuthCheck] computedSig: ${computedSig}`)
  if (computedSig === sig) {
    console.log(`[deposit-moonpayAuthCheck] if is true`)
    return next()
  } else {
    console.log(`[deposit-moonpayAuthCheck] if is false`)
    throw Error('Invalid moonpay signature')
  }
}

const transakAuthCheck = (req, res, next) => {
  console.log(`[deposit-transakAuthCheck] req.body: ${JSON.stringify(req.body)}`)
  try {
    if (!req.body || !req.body.data) {
      console.log(`[deposit-transakAuthCheck] no data`)
      throw new Error('Transak auth check failed - no data')
    }
    console.log(`[deposit-transakAuthCheck] before jwt verify`)
    req.body.data = jwt.verify(req.body.data, config.get('plugins.transak.api.secret'))
    console.log(`[deposit-transakAuthCheck] after jwt verify`)
    return next()
  } catch (err) {
    console.log(`[deposit-transakAuthCheck] catch: ${JSON.stringify(err)}`)
    throw new Error(`Transak auth check failed - ${err}`)
  }
}

const rampAuthCheck = (req, res, next) => {
  if (req.body && req.header('X-Body-Signature')) {
    console.log(`[deposit-rampAuthCheck]`)
    const verified = crypto.verify(
      'sha256',
      Buffer.from(stableStringify(req.body)),
      config.get('plugins.rampInstant.webhook.secret'),
      Buffer.from(req.header('X-Body-Signature'), 'base64')
    )
    if (verified) {
      console.log(`[deposit-rampAuthCheck] if is true`)
      return next()
    }
  } else {
    console.log(`[deposit-rampAuthCheck] if is false`)
    throw Error('Invalid ramp signature')
  }
}

router.post('/moonpay', moonpayAuthCheck, async (req, res) => {
  console.log(`[deposit-moonpay] req.body: ${JSON.stringify(req.body)}`)
  const { status } = req.body.data
  const { type } = req.body
  console.log(`[deposit-moonpay] status: ${status}, type: ${type}`)
  const currencies = config.get('plugins.moonpay.currencies')
  console.log(`[deposit-moonpay] currencies: ${JSON.stringify(currencies)}`)
  if (type === 'transaction_updated' && status === 'completed') {
    const { currencyId, cryptoTransactionId, quoteCurrencyAmount, walletAddress, id } = req.body.data
    const { externalCustomerId } = req.body
    const tokenAddress = currencies[currencyId]
    console.log(`[deposit-moonpay] currencyId: ${currencyId}, cryptoTransactionId: ${cryptoTransactionId}, quoteCurrencyAmount: ${quoteCurrencyAmount}, walletAddress: ${walletAddress}, id: ${id}, externalCustomerId: ${externalCustomerId}, tokenAddress: ${tokenAddress}`)
    if (!tokenAddress) {
      throw new Error(`The currency type ${currencyId} is not supported. Cannot process transaction ${cryptoTransactionId} from externalCustomerId ${externalCustomerId} (accountAddress_communityAddress)`)
    }
    console.log(`[deposit-moonpay] before makeDeposit`)
    const [customerAddress, communityAddress] = externalCustomerId.split('_')
    await makeDeposit({
      transactionHash: cryptoTransactionId,
      walletAddress,
      customerAddress,
      communityAddress,
      tokenAddress,
      amount: web3Utils.toWei(String(quoteCurrencyAmount)),
      externalId: id,
      provider: 'moonpay'
    })
    console.log(`[deposit-moonpay] after makeDeposit`)
    return res.json({ response: 'job started' })
  } else {
    console.log(`[deposit-moonpay] reached else`)
    return res.json({})
  }
})

router.post('/transak', transakAuthCheck, async (req, res) => {
  console.log(`[deposit-transak] req.body: ${JSON.stringify(req.body)}`)
  const { eventID, webhookData } = req.body.data
  console.log(`[deposit-transak] eventID: ${eventID}, webhookData: ${JSON.stringify(webhookData)}`)
  if (eventID === 'ORDER_COMPLETED' && webhookData.status === 'COMPLETED') {
    const { id, walletAddress, transactionHash, partnerCustomerId, cryptoAmount, cryptocurrency } = webhookData
    console.log(`[deposit-transak] id: ${id}, walletAddress: ${walletAddress}, transactionHash: ${transactionHash}, partnerCustomerId: ${partnerCustomerId}, cryptoAmount: ${cryptoAmount}, cryptocurrency: ${cryptocurrency}`)
    try {
      console.log(`[deposit-transak] try`)
      const filter = encodeURIComponent(`{"where":{"symbol":"${cryptocurrency}"}}`)
      console.log(`[deposit-transak] filter: ${filter}`)
      const url = `${config.get('plugins.transak.api.urlBase')}/crypto-currencies?filter=${filter}`
      console.log(`[deposit-transak] url: ${url}`)
      const response = await request.get(url)
      console.log(`[deposit-transak] response: ${JSON.stringify(response)}`)
      const cryptoCurrencyData = JSON.parse(response)
      console.log(`[deposit-transak] cryptoCurrencyData: ${JSON.stringify(cryptoCurrencyData)}`)
      const [customerAddress, communityAddress] = partnerCustomerId.split('_')
      console.log(`[deposit-moonpay] before makeDeposit`)
      await makeDeposit({
        transactionHash,
        walletAddress,
        customerAddress,
        communityAddress,
        tokenAddress: cryptoCurrencyData.address,
        amount: web3Utils.toWei(String(cryptoAmount)),
        externalId: id,
        provider: 'transak'
      })
      console.log(`[deposit-moonpay] after makeDeposit`)
      return res.json({ response: 'job started' })
    } catch (err) {
      console.log(`[deposit-transak] catch: ${JSON.stringify(err)}`)
      console.error(`Transak deposit failed`, err)
    }
  } else {
    console.log(`[deposit-transak] reached else`)
    return res.json({})
  }
})

router.post('/ramp', rampAuthCheck, async (req, res) => {
  console.log(`[deposit-ramp] req.body: ${JSON.stringify(req.body)}`)
  // Todo - new to make deposit to the user
})

module.exports = router
