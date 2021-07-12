const router = require('express').Router()
const moment = require('moment')
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const RewardClaim = mongoose.model('RewardClaim')
const { agenda } = require('@services/agenda')
const UserWallet = require('../../../../models/WalletBalance')

router.post('/claim/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { accountAddress } = req.user
  const wallet = await UserWallet.findOne({ walletAddress })
  if (wallet.accountAddress !== accountAddress) {
    return res.status(403).json({ error: `account address ${accountAddress} does not own the wallet ${walletAddress}` })
  }
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  let reward = await RewardClaim.findOne({ walletAddress, tokenAddress }).sort({ claimedAt: -1 })
  if (reward.isClaimed) {
    return res.status(400).json({ error: `no rewards are found for the wallet ${walletAddress}` })
  } else {
    
  }

})

router.get('/reward/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  let reward = await RewardClaim.findOne({ walletAddress, tokenAddress, isClaimed: false }).sort({ claimedAt: -1 })

  if (reward && reward.syncTimestamp - moment().unix() < config.get('apy.sync.interval  ')) {
    return res.json({ data: { rewardAmount: reward } })
  }

  await agenda.now('calculateApy', { walletAddress, tokenAddress })
  if (reward) {
    return res.json({ data: { rewardAmount: reward } })
  } else {
    return res.status(400).json({ error: `no reward found for wallet ${walletAddress}` })
  }
})

module.exports = router
