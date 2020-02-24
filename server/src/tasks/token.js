const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')
const { createNetwork } = require('@utils/web3')
const { withAccount, lockAccount } = require('@utils/account')
const { getAbi } = require('@constants/abi')
const config = require('config')
const homeAddresses = config.get('network.home.addresses')

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

const adminApprove = withAccount(async (account, { bridgeType, tokenAddress, wallet, spender, amount }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const transferManagerContractInstance = createContract(getAbi('TransferManager'), homeAddresses.walletModules.TransferManager)
  const method = createMethod(transferManagerContractInstance, 'approveToken', wallet, tokenAddress, spender, amount)

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

const adminTransfer = withAccount(async (account, { bridgeType, tokenAddress, amount, wallet, to }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const transferManagerContractInstance = createContract(getAbi('TransferManager'), homeAddresses.walletModules.TransferManager)

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
  mint,
  burn,
  burnFrom,
  adminApprove,
  adminTransfer
}
