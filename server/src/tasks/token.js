const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')
const ExpirableTokenAbi = require('@fuse/token-factory-contracts/abi/ExpirableToken')
const ExpirableTokenBytecode = require('@fuse/token-factory-contracts/build/ExpirableToken')
const { createNetwork } = require('@utils/web3')
const { withAccount, lockAccount } = require('@utils/account')
const { getAbi } = require('@constants/abi')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const Token = mongoose.model('Token')

const createToken = withAccount(async (account, { bridgeType, name, symbol, initialSupplyInWei, tokenURI, expiryTimestamp, spendabilityIdsArr }, job) => {
  const { createContract, createMethod, send, web3 } = createNetwork(bridgeType, account)
  const method = createMethod(createContract(ExpirableTokenAbi), 'deploy', { data: ExpirableTokenBytecode.bytecode, arguments: [name, symbol, initialSupplyInWei, tokenURI, expiryTimestamp] })
  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
  const tokenAddress = receipt.options.address
  const { blockNumber } = await web3.eth.getTransaction(job.attrs.data.txHash)

  job.attrs.data.tokenAddress = tokenAddress
  job.attrs.data.blockNumber = blockNumber
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
    spendabilityIds: spendabilityIdsArr
  }).save()

  job.attrs.data.token = token
  job.save()
}, ({ from }) => {
  return lockAccount({ address: from })
})

const mint = withAccount(async (account, { bridgeType, tokenAddress, amount, toAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)
  toAddress = toAddress || account.address
  const method = createMethod(tokenContractInstance, 'mint', toAddress, amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
}, ({ from }) => {
  return lockAccount({ address: from })
})

const burn = withAccount(async (account, { bridgeType, tokenAddress, amount }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'burn', amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
}, ({ from }) => {
  return lockAccount({ address: from })
})

const burnFrom = withAccount(async (account, { bridgeType, tokenAddress, amount, burnFromAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'burnFrom', burnFromAddress, amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
}, ({ from }) => {
  return lockAccount({ address: from })
})

const adminApprove = withAccount(async (account, { bridgeType, tokenAddress, wallet, spender, amount, burnFromAddress }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const userWallet = await UserWallet.findOne({ walletAddress: wallet })
  const transferManagerContractInstance = createContract(getAbi('TransferManager'), userWallet.walletModules.TransferManager)
  const method = createMethod(transferManagerContractInstance, 'approveToken', wallet, tokenAddress, spender, amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })

  const { agenda } = require('@services/agenda')
  if (burnFromAddress) {
    const burnJob = await agenda.now('burnFrom', { tokenAddress, bridgeType, from: account.address, amount, burnFromAddress })
    job.attrs.data.burnJobId = burnJob.attrs._id.toString()
    job.save()
  }
}, ({ from }) => {
  return lockAccount({ address: from })
})

const adminTransfer = withAccount(async (account, { bridgeType, tokenAddress, amount, wallet, to }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const userWallet = await UserWallet.findOne({ walletAddress: wallet })
  const transferManagerContractInstance = createContract(getAbi('TransferManager'), userWallet.walletModules.TransferManager)

  const method = createMethod(transferManagerContractInstance, 'transferToken', wallet, tokenAddress, to, amount, '0x')

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
}, ({ from }) => {
  return lockAccount({ address: from })
})

module.exports = {
  createToken,
  mint,
  burn,
  burnFrom,
  adminApprove,
  adminTransfer
}
