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
const { transfer } = require('@utils/token')
const { createNetwork } = require('@utils/web3')

const SECONDS_IN_YEAR = new BigNumber(3.154e+7)

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

const getLatestReward = async (walletAddress, tokenAddress) => {
  debugger
  const latestReward = await RewardClaim.findOne({ walletAddress, tokenAddress }).sort({ syncBlockNumber: -1 })
  if (latestReward) {
    return latestReward.isClaimed
      ? new RewardClaim({
        walletAddress,
        tokenAddress,
        syncTimestamp: latestReward.syncTimestamp,
        syncBlockNumber: latestReward.syncBlockNumber,
        nextClaimTimestamp: latestReward.claimTimestamp + config.get('apy.claim.interval')
      })
      : latestReward
  }
  return new RewardClaim({ walletAddress, tokenAddress, syncBlockNumber: config.get('apy.launch.blockNumber') })
}

const calulcateReward = async (walletAddress, tokenAddress, latestBlock) => {
  debugger
  const reward = await getLatestReward(walletAddress, tokenAddress)
  const { syncBlockNumber } = reward
  const walletBalancesAfter = await WalletBalance.find({ walletAddress, tokenAddress, blockNumber: { $gte: syncBlockNumber } }).sort({ blockNumber: 1 })
  const walletBalanceBefore = await WalletBalance.findOne({ walletAddress, tokenAddress, blockNumber: { $lt: syncBlockNumber } }).sort({ blockNumber: -1 })
  const walletBalances = walletBalanceBefore ? [walletBalanceBefore, ...walletBalancesAfter] : walletBalancesAfter
  const rewardSum = walletBalances.reduce((sum, wb, i) => {
    const nextTimestamp = walletBalances[i + 1] ? walletBalances[i + 1].blockTimestamp : latestBlock.timestamp
    const duration = nextTimestamp - wb.blockTimestamp
    return sum.plus(new BigNumber(wb.amount).multipliedBy(duration))
  }, new BigNumber(reward.amount))

  const currentReward = rewardSum.multipliedBy(config.get('apy.rate')).div(SECONDS_IN_YEAR)
  if (!reward.nextClaimTimestamp) {
    const firstWalletBalance = walletBalances[0]
    console.log({ firstWalletBalance })
    const lastClaimTimestamp = config.get('apy.launch.timestamp') < firstWalletBalance.blockTimestamp ? firstWalletBalance.blockTimestamp : config.get('apy.launch.timestamp')
    reward.nextClaimTimestamp = lastClaimTimestamp + config.get('apy.claim.interval')
  }
  reward.amount = currentReward.plus(get(reward, 'amount', '0')).toFixed(0)
  reward.humanAmount = adjustDecimals(reward.amount, config.get('network.home.contracts.fusd.decimals'), 0)
  reward.syncBlockNumber = latestBlock.number
  reward.syncTimestamp = latestBlock.timestamp
  console.log({ reward })
  return reward.save()
}

const calculate = async (walletAddress, tokenAddress) => {
  const latestBlock = await syncWalletBalances(walletAddress, tokenAddress)
  return calulcateReward(walletAddress, tokenAddress, latestBlock)
}

const claimApy = async (account, { walletAddress, tokenAddress }) => {
  const reward = await calculate(walletAddress, tokenAddress)
  const network = createNetwork('home', account)
  const { web3 } = network
  const { blockHash, blockNumber, status, transactionHash } = await transfer(network, { from: account.address, to: reward.walletAddress, tokenAddress, amount: reward.amount })
  if (!status) {
    throw new Error(`Failed to claim APY for ${walletAddress}`)
  }
  const { timestamp } = await web3.eth.getBlock(blockHash)
  reward.claimBlockNumber = blockNumber
  reward.claimTimestamp = timestamp
  reward.transactionHash = transactionHash
  reward.isClaimed = true
  await reward.save()

  return reward
}

module.exports = {
  calculate,
  claimApy
}
