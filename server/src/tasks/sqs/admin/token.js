const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')
const config = require('config')
const TokenFactoryABI = require('@fuse/token-factory-contracts/abi/TokenFactoryWithEvents')
const { createNetwork } = require('@utils/web3')
const { getAbi } = require('@constants/abi')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const Token = mongoose.model('Token')
const { fetchBalance } = require('@utils/token')
const BigNumber = require('bignumber.js')

const createToken = async (account, { bridgeType, name, symbol, initialSupplyInWei, tokenURI, expiryTimestamp, spendabilityIdsArr }, job) => {
  const { createContract, createMethod, send, web3 } = createNetwork(bridgeType, account)
  const tokenFactory = createContract(TokenFactoryABI, config.get('network.home.addresses.TokenFactory'))
  const method = createMethod(tokenFactory, 'createMintableBurnableToken', name, symbol, initialSupplyInWei, tokenURI)
  const receipt = await send(method, {
    from: account.address
  }, {
    job
  })
  const tokenAddress = receipt.events.TokenCreated.returnValues.token
  const { blockNumber } = await web3.eth.getTransaction(receipt.transactionHash)

  job.set('data.tokenAddress', tokenAddress)
  job.set('data.blockNumber', blockNumber)

  const token = await new Token({
    address: tokenAddress,
    name,
    symbol,
    tokenURI,
    totalSupply: initialSupplyInWei,
    owner: account.address,
    blockNumber,
    tokenType: 'expirable',
    networkType: bridgeType,
    expiryTimestamp,
    spendabilityIds: spendabilityIdsArr
  }).save()

  job.data.token = token
  job.save()
}

const mint = async (account, { bridgeType, tokenAddress, amount, toAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)
  toAddress = toAddress || account.address
  const method = createMethod(tokenContractInstance, 'mint', toAddress, amount)

  await send(method, {
    from: account.address
  }, {
    job
  })
}

const burn = async (account, { bridgeType, tokenAddress, amount }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'burn', amount)

  await send(method, {
    from: account.address
  }, {
    job
  })
}

const burnFrom = async (account, { bridgeType, tokenAddress, amount, burnFromAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'burnFrom', burnFromAddress, amount)

  await send(method, {
    from: account.address
  }, {
    job
  })
}

const adminApprove = async (account, { bridgeType, tokenAddress, wallet, spender, amount, burnFromAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const userWallet = await UserWallet.findOne({ walletAddress: wallet })
  const transferManagerContractInstance = createContract(getAbi('TransferManager'), userWallet.walletModules.TransferManager)
  const method = createMethod(transferManagerContractInstance, 'approveToken', wallet, tokenAddress, spender, amount)

  await send(method, {
    from: account.address
  }, {
    job,
    txName: 'approveToken'
  })

  if (burnFromAddress) {
    const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)
    const method = createMethod(tokenContractInstance, 'burnFrom', burnFromAddress, amount)

    await send(method, {
      from: account.address
    }, {
      job,
      txName: 'burnFrom'
    })
  }
}

const adminSpendabilityApprove = async (account, { bridgeType, tokenAddresses, wallet, spender, amount, burnFromAddress }, job) => {
  const { createContract } = createNetwork(bridgeType, account)
  const balancesData = (await Promise.all(tokenAddresses.map(async tokenAddress => {
    let balance = await fetchBalance({ createContract }, tokenAddress, wallet)
    return { tokenAddress, balance }
  }))).filter(obj => !obj.balance.isZero())
  if (balancesData.length === 0) {
    throw new Error(`No balances for ${wallet}`)
  }

  let total = new BigNumber(amount)
  let i = 0
  let jobs = []
  const taskManager = require('@services/taskManager')
  while (!total.isZero()) {
    let tokenAddress = balancesData[i].tokenAddress
    let balance = balancesData[i].balance
    if (total.lt(balance)) {
      jobs.push(await taskManager.now('adminApprove', { tokenAddress, bridgeType, accountAddress: account.address, wallet, spender, amount, burnFromAddress, correlationId: `${job.data.correlationId}-2` }))
      total = total.minus(total)
    } else {
      jobs.push(await taskManager.now('adminApprove', { tokenAddress, bridgeType, accountAddress: account.address, wallet, spender, amount, burnFromAddress, correlationId: `${job.data.correlationId}-2` }))
      total = total.minus(balance)
    }
    i++
  }
  job.set('data.transferJobs', jobs.map(job => job._id.toString()))
  job.save()
}

const adminTransfer = async (account, { bridgeType, tokenAddress, amount, wallet, to }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const userWallet = await UserWallet.findOne({ walletAddress: wallet })
  const transferManagerContractInstance = createContract(getAbi('TransferManager'), userWallet.walletModules.TransferManager)

  const method = createMethod(transferManagerContractInstance, 'transferToken', wallet, tokenAddress, to, amount, '0x')

  await send(method, {
    from: account.address
  }, {
    job
  })
}

const adminSpendabilityTransfer = async (account, { bridgeType, tokenAddresses, amount, wallet, to }, job) => {
  const { createContract } = createNetwork(bridgeType, account)
  const balancesData = (await Promise.all(tokenAddresses.map(async tokenAddress => {
    let balance = await fetchBalance({ createContract }, tokenAddress, wallet)
    return { tokenAddress, balance }
  }))).filter(obj => !obj.balance.isZero())
  if (balancesData.length === 0) {
    throw new Error(`No balances for ${wallet}`)
  }
  console.log({ balancesData })
  let total = new BigNumber(amount)
  let i = 0
  let jobs = []
  const taskManager = require('@services/taskManager')
  while (!total.isZero()) {
    let tokenAddress = balancesData[i].tokenAddress
    let balance = balancesData[i].balance
    if (total.lt(balance)) {
      jobs.push(await taskManager.now('adminTransfer', { tokenAddress, bridgeType, accountAddress: account.address, amount: total.toFixed(), wallet, to, correlationId: `${job.data.correlationId}-2` }))
      total = total.minus(total)
    } else {
      jobs.push(await taskManager.now('adminTransfer', { tokenAddress, bridgeType, accountAddress: account.address, amount: balance, wallet, to, correlationId: `${job.data.correlationId}-2` }))
      total = total.minus(balance)
    }
    i++
  }
  job.set('data.transferJobs', jobs.map(job => job._id.toString()))
  job.save()
}

module.exports = {
  createToken,
  mint,
  burn,
  burnFrom,
  adminApprove,
  adminSpendabilityApprove,
  adminTransfer,
  adminSpendabilityTransfer
}
