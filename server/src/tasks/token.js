const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')
const { createNetwork } = require('@utils/web3')
const { withAccount, lockAccount } = require('@utils/account')

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

module.exports = {
  mint,
  burn
}
