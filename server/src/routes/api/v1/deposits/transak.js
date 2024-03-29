const router = require('express').Router()
const lodash = require('lodash')
const jwt = require('jsonwebtoken')
const { initiateDeposit, cancelDeposit, fulfillDeposit } = require('@utils/deposit')
const config = require('config')
const { toWei } = require('@utils/token')

const transakAuthCheck = (req, res, next) => {
  console.log(`[deposit-transakAuthCheck] req.body: ${JSON.stringify(req.body)}`)
  try {
    if (!req.body || !req.body.data) {
      throw new Error('Transak auth check failed - no data')
    }
    req.body.data = jwt.verify(req.body.data, config.get('plugins.transak.api.secret'))
    return next()
  } catch (err) {
    console.log(`[deposit-transakAuthCheck] catch: ${JSON.stringify(err)}`)
    throw new Error(`Transak auth check failed - ${err}`)
  }
}

const getToken = (cryptocurrency) => {
  const tokensMapping = config.get('plugins.transak.tokensMapping')
  if (!lodash.has(tokensMapping, cryptocurrency)) {
    throw new Error(`token ${cryptocurrency} is not supported`)
  }
  return tokensMapping[cryptocurrency]
}

router.post('/', transakAuthCheck, async (req, res) => {
  const { eventID, webhookData } = req.body.data
  const provider = 'transak'
  console.log(`[deposit-transak] eventID: ${eventID}, webhookData: ${JSON.stringify(webhookData)}`)
  const { id, walletAddress, transactionHash, partnerCustomerId, cryptoAmount, cryptoCurrency, network } = webhookData
  const [customerAddress, communityAddress] = partnerCustomerId.split('_')
  const { tokenAddress, decimals } = getToken(cryptoCurrency)
  if (eventID === 'ORDER_COMPLETED' && webhookData.status === 'COMPLETED') {
    console.log(`[deposit-moonpay] before fulfillDeposit`)
    await fulfillDeposit({
      transactionHash,
      walletAddress,
      customerAddress,
      communityAddress,
      tokenAddress,
      tokenDecimals: decimals,
      amount: toWei(cryptoAmount, decimals),
      externalId: id,
      provider,
      network
    })

    return res.json({ response: 'ok' })
  } else if (eventID === 'ORDER_CREATED' && webhookData.status === 'AWAITING_PAYMENT_FROM_USER') {
    const requestData = {
      tokenAddress,
      tokenDecimals: decimals,
      customerAddress,
      walletAddress,
      communityAddress,
      amount: toWei(cryptoAmount, decimals),
      externalId: id,
      network,
      provider
    }

    await initiateDeposit(requestData)
    return res.json({ response: 'ok' })
  } else if (eventID === 'ORDER_FAILED') {
    const { id } = webhookData
    await cancelDeposit({
      customerAddress,
      externalId: id,
      provider
    })
    return res.json({ response: 'job canceled' })
  } else {
    console.log(`[deposit-transak] reached else with eventId ${eventID}`)
    return res.json({})
  }
})

module.exports = router
