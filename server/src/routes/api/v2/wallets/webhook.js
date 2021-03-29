const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { fetchTokenData } = require('@utils/token')
const home = require('@services/web3/home')
const BigNumber = require('bignumber.js')
const { handleSubscriptionWebHook } = require('@utils/wallet/actions')
const { subscribeAddress } = require('@services/subscriptionServices')
const auth = require('@routes/auth')

router.post('/subscribe', auth.admin, async (req, res) => {
  const { walletAddress } = req.body
  try {
    await subscribeAddress(walletAddress)
    return res.send({ data: `Subscribed ${walletAddress} successfully` })
  } catch (error) {
    return res.status(400).send({ error })
  }
})

router.post('/', async (req, res) => {
  const { args, address: tokenAddress, transactionHash } = req.body
  console.log(`got txHash ${transactionHash} from the wehbook`)
  const [from, to, { hex }] = args
  const action = await WalletAction.findOne({ 'data.txHash': transactionHash })
  if (!action) {
    const { decimals: tokenDecimal, name: tokenName, symbol: tokenSymbol } = await fetchTokenData(tokenAddress, {}, home.web3)

    const data = {
      txHash: transactionHash,
      walletAddress: to,
      to,
      from,
      tokenName,
      tokenSymbol,
      tokenDecimal: parseInt(tokenDecimal),
      asset: tokenSymbol,
      status: 'confirmed',
      value: new BigNumber(hex),
      tokenAddress: tokenAddress.toLowerCase(),
      timeStamp: (Math.round(new Date().getTime() / 1000)).toString()
    }
    await handleSubscriptionWebHook(data)
  } else {
    console.log(`txHash ${transactionHash} already handled in action ${action._id}`)
  }
  res.send({ data: 'ok' })
})

module.exports = router
