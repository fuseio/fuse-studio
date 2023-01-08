const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const BigNumber = require('bignumber.js')
const { handleSubscriptionWebHook } = require('@utils/wallet/actions')
const { subscribeToNotificationService } = require('@services/subscription/charge')
const auth = require('@routes/auth')
const config = require('config')
const { notifyReceiver } = require('@services/firebase')
const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
const fuseDollarAccount = config.get('plugins.rampInstant.fuseDollarAccount')
const apyFunderAddress = config.get('apy.account.address')
const ignoredAccounts = [fuseDollarAccount, apyFunderAddress]

router.post('/subscribe', auth.admin, async (req, res) => {
  const { walletAddress } = req.body
  try {
    await subscribeToNotificationService(walletAddress)
    return res.send({ data: `Subscribed ${walletAddress} successfully` })
  } catch (error) {
    return res.status(400).send({ error })
  }
})

router.post('/', async (req, res) => {
  console.log(`[CHARGE-WEBHOOK] req.body: ${JSON.stringify(req.body)}`)
  const {
    to,
    from,
    txHash,
    tokenAddress,
    tokenType,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    value
  } = req.body

  console.log(`got txHash ${txHash} from the webhook`)

  if (tokenAddress === fuseDollarAddress && ignoredAccounts.includes(from)) {
    console.log(`deposit event received from the subscription webhook, skipping`)
    return res.send({ data: 'ok' })
  }

  const action = await WalletAction.findOne({ 'data.txHash': txHash })
  if (!action) {
    const data = {
      txHash,
      walletAddress: to,
      to,
      from,
      tokenName,
      tokenSymbol,
      tokenDecimal: parseInt(tokenDecimals),
      asset: tokenSymbol,
      status: 'confirmed',
      tokenType,
      value: new BigNumber(value).toFixed(),
      tokenAddress: tokenAddress.toLowerCase(),
      timeStamp: (Math.round(new Date().getTime() / 1000)).toString()
    }
    await handleSubscriptionWebHook(data)
    notifyReceiver({
      receiverAddress: to,
      tokenAddress,
      amountInWei: value,
      tokenDecimals: parseInt(tokenDecimals),
      tokenType
    }).catch(console.error)
  } else {
    console.log(`txHash ${txHash} already handled in action ${action._id}`)
  }
  res.send({ data: 'ok' })
})

module.exports = router
