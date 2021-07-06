const router = require('express').Router()
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const WalletBalance = mongoose.model('WalletBalance')
const UserWallet = mongoose.model('UserWallet')
const RewardClaim = mongoose.model('RewardClaim')
const { get } = require('lodash')
const { createContract } = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')

const tokenAddress = config.get('network.home.addresses.FuseDollar')
const tokenContract = createContract(BasicTokenAbi, tokenAddress)

router.post('/claim/:walletAddress', auth.required, async (req, res) => {

})

const INTERVAL_SYNC = new Date()

router.get('/reward/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params
  const userWallet = await WalletBalance.findOne({ walletAddress })
  if (!userWallet) {
    throw new Error(`wallet for address ${walletAddress}`)
  }
  const reward = RewardClaim.findOne.findOne({ walletAddress, isClaimed: false }).sort({ claimedAt: -1 })
  if (reward.syncedAt - new Date() < INTERVAL_SYNC) {
    res.json({ data: { rewardAmount: reward } })
  }
  // get last reward claimed
  // const claimedReward = await RewardClaim.findOne().sort({ claimedAt: -1 })
  const walletBalance = await WalletBalance.findOne({ walletAddress }).sort({ claimedAt: -1 })
  const latestBlocknumber = get(walletBalance, 'blockNumber')
  // const tokenAddress = config.get('network.home.addresses.FuseDollar')
  const events = await tokenContract.getPastEvents('Transfer', { fromBlock: latestBlocknumber, from: walletAddress })
  for (let event of events) {
    console.log({ event })
  }
  return res.json({ events })

  // calculate rewards till the last claim to today
})

module.exports = router
