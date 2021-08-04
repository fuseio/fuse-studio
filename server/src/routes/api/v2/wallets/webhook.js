const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { fetchTokenData } = require('@utils/token')
const home = require('@services/web3/home')
const BigNumber = require('bignumber.js')
const { handleSubscriptionWebHook } = require('@utils/wallet/actions')
const { subscribeAddress } = require('@services/subscription')
const auth = require('@routes/auth')
const config = require('config')
const { AddressZero } = require('ethers/constants')
const { notifyReceiver } = require('@services/firebase')

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

router.post('/', auth.subscriptionService, async (req, res) => {
  const { to, from, address, txHash, value } = req.body
  const tokenAddress = address || AddressZero
  console.log(req.headers)
  console.log(`got txHash ${txHash} from the wehbook`)
  if (tokenAddress === fuseDollarAddress && ingnoredAccounts.includes(from)) {
    console.log(`deposit event received from the subscription webhook, skipping`)
    res.send({ data: 'ok' })
    return
  }

  const action = await WalletAction.findOne({ 'data.txHash': txHash })
  if (!action) {
    const { decimals: tokenDecimal, name: tokenName, symbol: tokenSymbol } = await fetchTokenData(tokenAddress, {}, home.web3)

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
      value: new BigNumber(value),
      tokenAddress: tokenAddress.toLowerCase(),
      timeStamp: (Math.round(new Date().getTime() / 1000)).toString()
    }
    await handleSubscriptionWebHook(data)
    notifyReceiver({
      receiverAddress: to,
      tokenAddress,
      amountInWei: value
    })
      .catch(console.error)
  } else {
    console.log(`txHash ${txHash} already handled in action ${action._id}`)
  }
  res.send({ data: 'ok' })
})

module.exports = router
