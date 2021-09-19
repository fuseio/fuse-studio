const router = require('express').Router()
const moment = require('moment')
const config = require('config')
const auth = require('@routes/auth')
const { walletOwner } = require('./auth')
const mongoose = require('mongoose')
const RewardClaim = mongoose.model('RewardClaim')
const WalletApy = mongoose.model('WalletApy')
const { agenda } = require('@services/agenda')
const { get } = require('lodash')
const taskManager = require('@services/taskManager')
const UserWallet = require('@models/UserWallet')
const { web3 } = require('@services/web3/home')
const { calculateReward, syncAndCalculateApy } = require('@utils/apy')

router.post('/claim/:walletAddress', walletOwner, async (req, res) => {
  const { walletAddress } = req.params
  const { accountAddress } = req.user
  const wallet = await UserWallet.findOne({ walletAddress })

  if (wallet.accountAddress.toLowerCase() !== accountAddress.toLowerCase()) {
    return res.status(403).json({ error: `account address ${accountAddress} does not own the wallet ${walletAddress}` })
  }
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  let reward = await RewardClaim.findOne({ walletAddress, tokenAddress, isClaimed: false }).sort({ nextClaimTimestamp: -1 })
  if (!reward || reward.isClaimed) {
    const msg = `No active reward found for wallet ${walletAddress}. This should be calculated soon`
    console.warn(msg)
  }
  if (reward && reward.nextClaimTimestamp > moment().unix()) {
    return res.status(403).json({ error: `reward for ${walletAddress} will be claimable on timestamp ${reward.nextClaimTimestamp}` })
  }
  const syncedReward = await syncAndCalculateApy(walletAddress, tokenAddress)
  const job = await taskManager.now('claimApy', { walletAddress, tokenAddress, reward, transactionBody: { value: get(syncedReward, 'amount'), status: 'pending', rewardId: syncedReward._id } }, { isWalletJob: true })
  return res.json({ data: job })
})

router.post('/enable/:walletAddress', walletOwner, async (req, res) => {
  const { walletAddress } = req.params
  const wallet = await UserWallet.findOne({ walletAddress }).populate('apy')
  let { apy } = wallet

  if (apy && apy.isEnabled) {
    return res.status(403).json({ error: `Apy already enbabled for wallet ${walletAddress}` })
  }

  const latestBlock = await web3.eth.getBlock('latest')
  apy = await new WalletApy({
    isEnabled: true,
    walletAddress,
    sinceTimestamp: latestBlock.timestamp,
    sinceBlockNumber: latestBlock.number
  }).save()

  wallet.apy = apy._id
  await wallet.save()

  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  const job = await agenda.now('syncAndCalculateApy', { walletAddress, tokenAddress })

  return res.json({ data: { wallet, job } })
})

router.post('/sync/:walletAddress', auth.admin, async (req, res) => {
  const { walletAddress } = req.params
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  const job = await agenda.now('syncAndCalculateApy', { walletAddress, tokenAddress })
  return res.json({ job })
})

router.get('/reward/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  const reward = await calculateReward(walletAddress, tokenAddress)

  if (reward) {
    return res.json({ data: { reward } })
  } else {
    const msg = `no active reward found for wallet ${walletAddress}`
    console.warn(msg)
    return res.status(400).json({ error: msg })
  }
})

module.exports = router
