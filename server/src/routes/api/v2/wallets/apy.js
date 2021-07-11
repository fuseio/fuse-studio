const router = require('express').Router()
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const WalletBalance = mongoose.model('WalletBalance')
const RewardClaim = mongoose.model('RewardClaim')
const { get, join, sortBy, last, keyBy } = require('lodash')
const { createContract, web3 } = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const BigNumber = require('bignumber.js')
const { adjustDecimals } = require('@utils/token')
const { fuseBlocksClient } = require('@services/graph')
const moment = require('moment')

router.post('/claim/:walletAddress', auth.required, async (req, res) => {

})

const INTERVAL_SYNC = 10000
const FUSD_CREATION_BLOCK = 9394716
const FUSD_DECIMALS = 18
const APY_LAUNCH_BLOCKNUMBER = 11900000
const APY_LAUNCH_TIMESTAMP = 1625818720
const SECONDS_IN_YEAR = new BigNumber(3.154e+7)
const SECONDS_IN_WEEK = 604800
const YEARLY_APY = 0.05

const toHumanAmount = (amount) => adjustDecimals(amount, FUSD_DECIMALS, 0)

const fetchTimestamps = async (blockHashesList) => {
  if (blockHashesList.length > 0) {
    const query = `{blocks(where: {id_in: ["${join(blockHashesList, '", "')}"]}) {timestamp, id}}`
    const { blocks } = await fuseBlocksClient.request(query)
    if (blockHashesList.length !== blocks.length) {
      throw new Error('Block timestamps are missing. Cannot continue.')
    }
    return blocks
  } else {
    return []
  }
}

const syncWalletBalances = async (walletAddress, tokenAddress) => {
  const walletBalance = await WalletBalance.findOne({ walletAddress, tokenAddress }).sort({ blockNumber: -1 })
  const fromBlock = get(walletBalance, 'blockNumber', FUSD_CREATION_BLOCK) + 1
  const latestBlock = await web3.eth.getBlock('latest')
  const latestBlockNumber = latestBlock.number
  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const currentTokenBalance = await tokenContract.methods.balanceOf(walletAddress).call({}, latestBlockNumber)
  console.log({ currentTokenBalance })
  console.log(`querying trasnfer events for contract ${tokenAddress} from block ${fromBlock} to block ${latestBlockNumber}`)
  const fromTransfers = await tokenContract.getPastEvents('allEvents', { fromBlock, toBlock: latestBlockNumber, topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x000000000000000000000000d418c5d0c4a3d87a6c555b7aa41f13ef87485ec6'] })
  const toTransfers = await tokenContract.getPastEvents('allEvents', { fromBlock, toBlock: latestBlockNumber, topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', undefined, '0x000000000000000000000000d418c5d0c4a3d87a6c555b7aa41f13ef87485ec6'] })
  const transfers = sortBy([...fromTransfers.map(tx => ({ ...tx, type: 'OUT' })), ...toTransfers.map(tx => ({ ...tx, type: 'IN' }))], 'blockNumber')
  console.log(`Found ${fromTransfers.length} OUT transfers and ${toTransfers.length} IN transfers`)

  let iteratedBalanceAmount = new BigNumber(get(walletBalance, 'amount', '0'))
  let walletBalances = []

  const blocksMap = keyBy(await fetchTimestamps(transfers.map(({ blockHash }) => blockHash)), 'id')
  for (let tx of transfers) {
    const { blockNumber, transactionHash, blockHash } = tx
    // console.log(tx)
    // two events got the same blocknumber. meaning one is redundant
    if (last(walletBalances) && blockNumber === last(walletBalances).blockNumber) {
      walletBalances.pop()
    }

    iteratedBalanceAmount = tx.type === 'IN' ? iteratedBalanceAmount.plus(tx.returnValues.value) : iteratedBalanceAmount.minus(tx.returnValues.value)

    const walletBalance = new WalletBalance({
      walletAddress,
      tokenAddress,
      amount: iteratedBalanceAmount.toFixed(),
      humanAmount: parseInt(toHumanAmount(iteratedBalanceAmount)),
      blockNumber,
      blockHash,
      blockTimestamp: blocksMap[blockHash].timestamp,
      transactionHash
    })
    walletBalances.push(walletBalance)
  }

  if (walletBalances.length > 0 && last(walletBalances).amount !== currentTokenBalance) {
    throw new Error(`Balance calculations is not correct for ${walletAddress}: ${toHumanAmount(last(walletBalances).amount)} is not equal to ${toHumanAmount(currentTokenBalance)}. Cannot continue balance syncing.`)
  }
  await WalletBalance.create(walletBalances)
  return latestBlock
}

const getUnclaimedReward = async (walletAddress, tokenAddress, latestBlock) => {
  const latestReward = await RewardClaim.findOne({ walletAddress }).sort({ claimedAt: -1 })
  if (latestReward && !latestReward.isClaimed) {
    return latestReward
  }
  const nextClaimTimestamp = latestReward ? latestReward.claimedTimestamp + SECONDS_IN_WEEK : latestBlock.timestamp + SECONDS_IN_WEEK
  const syncBlockNumber = latestReward ? latestReward.syncBlockNumber : APY_LAUNCH_BLOCKNUMBER
  const syncTimestamp = latestReward ? latestReward.syncTimestamp : APY_LAUNCH_TIMESTAMP

  return new RewardClaim({
    walletAddress,
    tokenAddress,
    nextClaimTimestamp,
    syncBlockNumber,
    syncTimestamp
  })
}

const calulcateReward = async (walletAddress, tokenAddress, latestBlock) => {
  // let latestReward = await RewardClaim.findOne({ walletAddress }).sort({ claimedAt: -1 })
  // if (latestReward)
  const reward = await getUnclaimedReward(walletAddress, tokenAddress, latestBlock)
  const { syncBlockNumber } = reward
  const walletBalancesAfter = await WalletBalance.find({ walletAddress, tokenAddress, blockNumber: { $gte: syncBlockNumber } }).sort({ blockNumber: 1 })
  const walletBalanceBefore = await WalletBalance.findOne({ walletAddress, tokenAddress, blockNumber: { $lt: syncBlockNumber } }).sort({ blockNumber: -1 })
  const walletBalances = [walletBalanceBefore, ...walletBalancesAfter]
  const rewardSum = walletBalances.reduce((sum, wb, i) => {
    const nextTimestamp = walletBalances[i + 1] ? walletBalances[i + 1].blockTimestamp : latestBlock.timestamp
    const duration = nextTimestamp - wb.blockTimestamp
    console.log({ nextTimestamp, duration, a: wb.amount })
    return sum.plus(new BigNumber(wb.amount).multipliedBy(duration))
  }, new BigNumber(reward.amount))
  console.log({ rewardSum: rewardSum.toFixed() })
  const currentReward = rewardSum.div(SECONDS_IN_YEAR).multipliedBy(YEARLY_APY)
  reward.amount = currentReward.toString()
  reward.humanAmount = adjustDecimals(reward.amount, FUSD_DECIMALS, 0)
  return reward.save()
}

const sync = async (walletAddress, tokenAddress) => {
  const latestBlock = await syncWalletBalances(walletAddress, tokenAddress)
  await calulcateReward(walletAddress, tokenAddress, latestBlock)
}

router.get('/reward/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params
  // const userWallet = await WalletBalance.findOne({ walletAddress })
  // if (!userWallet) {
  //   throw new Error(`wallet for address ${walletAddress}`)
  // }
  let reward = await RewardClaim.findOne({ walletAddress, isClaimed: false }).sort({ claimedAt: -1 })
  if (reward && reward.syncTimestamp - moment().unix() < INTERVAL_SYNC) {
    return res.json({ data: { rewardAmount: reward } })
  }
  const tokenAddress = config.get('network.home.addresses.FuseDollar')
  reward = await sync(walletAddress, tokenAddress)
  return res.json({ data: reward })
})

module.exports = router
