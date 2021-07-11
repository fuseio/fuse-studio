const router = require('express').Router()
const moment = require('moment')
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const RewardClaim = mongoose.model('RewardClaim')
const { agenda } = require('@services/agenda')

router.post('/claim/:walletAddress', auth.required, async (req, res) => {

})

router.get('/reward/:walletAddress', async (req, res) => {
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
    return res.json({ error: `no reward found for wallet ${walletAddress}` })
  }
})

module.exports = router
