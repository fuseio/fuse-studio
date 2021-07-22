const router = require('express').Router()
const moment = require('moment')
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const RewardClaim = mongoose.model('RewardClaim')
const { agenda } = require('@services/agenda')
const taskManager = require('@services/taskManager')
const UserWallet = require('@models/UserWallet')

router.post('/claim/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { accountAddress } = req.user
  const wallet = await UserWallet.findOne({ walletAddress })

  if (wallet.accountAddress.toLowerCase() !== accountAddress.toLowerCase()) {
    return res.status(403).json({ error: `account address ${accountAddress} does not own the wallet ${walletAddress}` })
  }
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  let reward = await RewardClaim.findOne({ walletAddress, tokenAddress, isClaimed: false }).sort({ nextClaimTimestamp: -1 })
  if (!reward || reward.isClaimed) {
    const msg = `No active reward found for wallet ${walletAddress}. Starting the calculation`
    console.warn(msg)
    await agenda.now('calculateApy', { walletAddress, tokenAddress })
    return res.status(403).json({ error: msg })
  }
  if (reward.nextClaimTimestamp > moment().unix()) {
    return res.status(403).json({ error: `reward for ${walletAddress} will be claimable on timestamp ${reward.nextClaimTimestamp}` })
  }
  const job = await taskManager.now('claimApy', { walletAddress, tokenAddress, reward, transactionBody: { value: reward.amount, status: 'pending' } }, { isWalletJob: true })
  return res.json({ data: job })
})

router.get('/reward/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  let reward = await RewardClaim.findOne({ walletAddress, tokenAddress, isClaimed: false }).sort({ claimedAt: -1 })

  if (reward && reward.syncTimestamp - moment().unix() < config.get('apy.sync.interval')) {
    return res.json({ data: { rewardAmount: reward } })
  }

  await agenda.now('calculateApy', { walletAddress, tokenAddress })
  if (reward) {
    return res.json({ data: { reward } })
  } else {
    return res.status(400).json({ error: `no reward found for wallet ${walletAddress}` })
  }
})

module.exports = router
