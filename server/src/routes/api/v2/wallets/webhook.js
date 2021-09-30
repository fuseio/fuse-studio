const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { fetchTokenData, fetchNftData } = require('@utils/token')
const home = require('@services/web3/home')
const BigNumber = require('bignumber.js')
const { handleSubscriptionWebHook } = require('@utils/wallet/actions')
const { subscribeAddress } = require('@services/subscription')
const auth = require('@routes/auth')
const config = require('config')
const { notifyReceiver } = require('@services/firebase')
const { agenda } = require('@services/agenda')

const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
const fuseDollarAccount = config.get('plugins.rampInstant.fuseDollarAccount')
const apyFunderAddress = config.get('apy.account.address')
const ingnoredAccounts = [fuseDollarAccount, apyFunderAddress]

router.post('/subscribe', auth.admin, async (req, res) => {
  const { walletAddress } = req.body
  try {
    await subscribeAddress(walletAddress)
    return res.send({ data: `Subscribed ${walletAddress} successfully` })
  } catch (error) {
    return res.status(400).send({ error })
  }
})

const fetchTokenDataByType = async ({ tokenType, tokenAddress }) => {
  if (tokenType === 'ERC-20' || tokenType === 'native') {
    const { decimals: tokenDecimal, name: tokenName, symbol: tokenSymbol } = await fetchTokenData(tokenAddress, {}, home.web3)
    return { tokenDecimal, tokenName, tokenSymbol }
  } else if (tokenType === 'ERC-721') {
    const { name: tokenName, symbol: tokenSymbol } = await fetchNftData(tokenAddress, {}, home.web3)
    return { tokenDecimal: 1, tokenName, tokenSymbol }
  }
}

router.post('/', auth.subscriptionService, async (req, res) => {
  const { to, from, address, txHash, value, subscribers, tokenType, blockNumber } = { tokenType: 'native', ...req.body }

  const tokenAddress = address || config.get('network.home.native.address')
  console.log(`got txHash ${txHash} from the wehbook`)

  if (tokenAddress === fuseDollarAddress) {
    for (let subscriber of subscribers) {
      await agenda.now('syncAndCalculateApy', { walletAddress: subscriber, tokenAddress, toBlockNumber: blockNumber })
    }
  }
  if (tokenAddress === fuseDollarAddress && ingnoredAccounts.includes(from)) {
    console.log(`deposit event received from the subscription webhook, skipping`)
    res.send({ data: 'ok' })
    return
  }

  const action = await WalletAction.findOne({ 'data.txHash': txHash })
  if (!action) {
    const { tokenDecimal, tokenName, tokenSymbol } = await fetchTokenDataByType({ tokenAddress, tokenType })
    const data = {
      txHash,
      walletAddress: to,
      to,
      from,
      tokenName,
      tokenSymbol,
      tokenDecimal: parseInt(tokenDecimal),
      asset: tokenSymbol,
      status: 'confirmed',
      tokenType,
      value: new BigNumber(value),
      tokenAddress: tokenAddress.toLowerCase(),
      timeStamp: (Math.round(new Date().getTime() / 1000)).toString()
    }
    await handleSubscriptionWebHook(data)
    notifyReceiver({
      receiverAddress: to,
      tokenAddress,
      amountInWei: value,
      tokenDecimal: parseInt(tokenDecimal),
      tokenType
    })
      .catch(console.error)
  } else {
    console.log(`txHash ${txHash} already handled in action ${action._id}`)
  }
  res.send({ data: 'ok' })
})

module.exports = router
