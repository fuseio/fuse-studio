const router = require('express').Router()
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const WalletBalance = mongoose.model('WalletBalance')
// const UserWallet = mongoose.model('UserWallet')
const RewardClaim = mongoose.model('RewardClaim')
const { get } = require('lodash')
const { createContract } = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const { sortBy } = require('lodash')

router.post('/claim/:walletAddress', auth.required, async (req, res) => {

})

const INTERVAL_SYNC = 10000

const sync = async ({ walletAddress }) => {
  const walletBalance = await WalletBalance.findOne({ walletAddress }).sort({ claimedAt: -1 })
  const fromBlock = get(walletBalance, 'blockNumber', 'earliest')

  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  const tokenContract = createContract(BasicTokenAbi, '0x249BE57637D8B013Ad64785404b24aeBaE9B098B')
  console.log({ walletAddress, tokenAddress })

  const fromEvents = await tokenContract.getPastEvents('allEvents', { fromBlock, toBlock: 'latest', topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x000000000000000000000000d418c5d0c4a3d87a6c555b7aa41f13ef87485ec6'] })
  const toEvents = await tokenContract.getPastEvents('allEvents', { fromBlock, toBlock: 'latest', topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', undefined, '0x000000000000000000000000d418c5d0c4a3d87a6c555b7aa41f13ef87485ec6'] })
  const events = sortBy([...fromEvents, ...toEvents], 'blockNumber')
  // console.log({ events })
  for (let event of events) {
    console.log({ event })
  }
}

router.get('/reward/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params
  // const userWallet = await WalletBalance.findOne({ walletAddress })
  // if (!userWallet) {
  //   throw new Error(`wallet for address ${walletAddress}`)
  // }
  const reward = RewardClaim.findOne({ walletAddress, isClaimed: false }).sort({ claimedAt: -1 })
  if (reward && reward.syncedAt - new Date() < INTERVAL_SYNC) {
    res.json({ data: { rewardAmount: reward } })
  }

  await sync({ walletAddress })
  // get last reward claimed
  // const claimedReward = await RewardClaim.findOne().sort({ claimedAt: -1 })
  // const walletBalance = await WalletBalance.findOne({ walletAddress }).sort({ claimedAt: -1 })
  // const latestBlocknumber = get(walletBalance, 'blockNumber')
  // // const tokenAddress = config.get('network.home.addresses.FuseDollar')
  // const events = await tokenContract.getPastEvents('Transfer', { fromBlock: latestBlocknumber, from: walletAddress })
  // for (let event of events) {
  //   console.log({ event })
  // }
  return res.json({ response: 'ok' })

  // calculate rewards till the last claim to today

})

module.exports = router
