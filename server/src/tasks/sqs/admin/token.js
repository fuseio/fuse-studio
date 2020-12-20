const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')
const ExpirableTokenAbi = require('@fuse/token-factory-contracts/abi/ExpirableToken')
const ExpirableTokenBytecode = require('@fuse/token-factory-contracts/build/ExpirableToken')
const { createNetwork } = require('@utils/web3')
const { getAbi } = require('@constants/abi')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const Token = mongoose.model('Token')
const { fetchBalance } = require('@utils/token')
const BigNumber = require('bignumber.js')

const createToken = async (account, { bridgeType, name, symbol, initialSupplyInWei, tokenURI, expiryTimestamp, spendabilityIdsArr }, job) => {
  const { createContract, createMethod, send, web3 } = createNetwork(bridgeType, account)
  const method = createMethod(createContract(ExpirableTokenAbi), 'deploy', { data: ExpirableTokenBytecode.bytecode, arguments: [name, symbol, initialSupplyInWei, tokenURI, expiryTimestamp] })
  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
  })
  const tokenAddress = receipt.options.address
  const { blockNumber } = await web3.eth.getTransaction(receipt.transactionHash)

  job.set('data.tokenAddress', tokenAddress)
  job.set('data.blockNumber', blockNumber)

  job.save()

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
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
  })
}

const burn = async (account, { bridgeType, tokenAddress, amount }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'burn', amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
  })
}

const burnFrom = async (account, { bridgeType, tokenAddress, amount, burnFromAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'burnFrom', burnFromAddress, amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
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
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
  })

  if (burnFromAddress) {
    const taskManager = require('@services/taskManager')
    const burnJob = await taskManager.now('burnFrom', { tokenAddress, bridgeType, from: account.address, amount, burnFromAddress, correlationId: `${job.data.correlationId}-2` })
    job.set('data.burnJobId', burnJob._id.toString())
    job.save()
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
      jobs.push(await taskManager.now('adminApprove', { tokenAddress, bridgeType, from: account.address, wallet, spender, amount, burnFromAddress, correlationId: `${job.data.correlationId}-2` }))
      total = total.minus(total)
    } else {
      jobs.push(await taskManager.now('adminApprove', { tokenAddress, bridgeType, from: account.address, wallet, spender, amount, burnFromAddress, correlationId: `${job.data.correlationId}-2` }))
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
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.set('data.txHash', hash)
      job.save()
    }
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
      jobs.push(await taskManager.now('adminTransfer', { tokenAddress, bridgeType, from: account.address, amount: total.toFixed(), wallet, to, correlationId: `${job.data.correlationId}-2` }))
      total = total.minus(total)
    } else {
      jobs.push(await taskManager.now('adminTransfer', { tokenAddress, bridgeType, from: account.address, amount: balance, wallet, to, correlationId: `${job.data.correlationId}-2` }))
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
