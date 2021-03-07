const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { fetchTokenData } = require('@utils/token')
const home = require('@services/web3/home')
const BigNumber = require('bignumber.js')
const { handleSubscriptionWebHook } = require('@utils/wallet/actions')
const { subscribeToSubscriptionService } = require('@services/subscriptionServices')
const auth = require('@routes/auth')

router.post('/subscribe', auth.admin, async (req, res) => {
  const { walletAddress } = req.body
  try {
    await subscribeToSubscriptionService(walletAddress)
    return res.send({ data: `Subscribed ${walletAddress} successfully` })
  } catch (error) {
    return res.status(400).send({ error })
  }
})

router.post('/', async (req, res) => {
  const { args, address: tokenAddress, transactionHash } = req.body
  const [from, to, { hex }] = args
  const { decimal: tokenDecimal, name: tokenName, symbol: tokenSymbol } = await fetchTokenData(tokenAddress, {}, home.web3)
  const actions = await WalletAction.find({ 'data.transactionBody.txHash': transactionHash })
  if (!actions.length) {
    const data = {
      txHash: transactionHash,
      walletAddress: to,
      transactionBody: {
        to,
        from,
        tokenName,
        tokenSymbol,
        tokenDecimal,
        asset: tokenSymbol,
        status: 'confirmed',
        value: new BigNumber(hex),
        tokenAddress: tokenAddress.toLowerCase(),
        timeStamp: (Math.round(new Date().getTime() / 1000)).toString()
      }
    }
    await handleSubscriptionWebHook(data)
  }
  res.send({ data: 'ok' })
})

module.exports = router
