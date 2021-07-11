const config = require('config')
const mongoose = require('mongoose')
const WalletBalance = mongoose.model('WalletBalance')
const RewardClaim = mongoose.model('RewardClaim')
const { get, join, sortBy, last, keyBy } = require('lodash')
const { createContract, web3 } = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const BigNumber = require('bignumber.js')
const { adjustDecimals } = require('@utils/token')
const { fuseBlocksClient } = require('@services/graph')

const SECONDS_IN_YEAR = new BigNumber(3.154e+7)
const SECONDS_IN_WEEK = 604800

const toHumanAmount = (amount) => adjustDecimals(amount, config.get('network.home.contracts.fusd.decimals'), 0)

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
  const fromBlock = get(walletBalance, 'blockNumber', config.get('network.home.contracts.fusd.deploymentBlock')) + 1
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

const getUnclaimedReward = async (walletAddress, tokenAddress) => {
  const latestReward = await RewardClaim.findOne({ walletAddress, tokenAddress }).sort({ claimedAt: -1 })
  if (latestReward && !latestReward.isClaimed) {
    return latestReward
  }
  let lastClaimTimestamp
  if (!latestReward) {
    const firstBalance = await WalletBalance.findOne({ walletAddress, tokenAddress, blockNumber: { $gte: config.get('network.home.contracts.fusd.deploymentBlock') } }).sort({ blockNumber: 1 })
    lastClaimTimestamp = firstBalance.blockTimestamp
  } else {
    lastClaimTimestamp = get(latestReward, 'claimedTimestamp')
  }
  const nextClaimTimestamp = lastClaimTimestamp + SECONDS_IN_WEEK
  const syncBlockNumber = get(latestReward, 'syncBlockNumber', config.get('apy.launch.blockNumber'))
  const syncTimestamp = get(latestReward, 'syncTimestamp', config.get('apy.launch.timestamp'))

  return new RewardClaim({
    walletAddress,
    tokenAddress,
    nextClaimTimestamp,
    syncBlockNumber,
    syncTimestamp
  })
}

const calulcateReward = async (walletAddress, tokenAddress, latestBlock) => {
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

  const currentReward = rewardSum.div(SECONDS_IN_YEAR).multipliedBy(config.get('apy.rate'))
  reward.amount = currentReward.toString()
  reward.humanAmount = adjustDecimals(reward.amount, config.get('network.home.contracts.fusd.decimals'), 0)
  return reward.save()
}

const calculate = async (walletAddress, tokenAddress) => {
  const latestBlock = await syncWalletBalances(walletAddress, tokenAddress)
  await calulcateReward(walletAddress, tokenAddress, latestBlock)
}

module.exports = {
  calculate
}
