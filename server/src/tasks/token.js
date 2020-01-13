const MintableBurnableTokenAbi = require('@fuse/token-factory-contracts/abi/MintableBurnableToken')
const { createNetwork } = require('@utils/web3')
const { withAccount, lockAccount } = require('@utils/account')

const mint = withAccount(async (account, { bridgeType, tokenAddress, amount }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(MintableBurnableTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'mint', account.address, amount)

  await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })

  // await handleReceipt(receipt)
}, ({ from }) => {
  return lockAccount({ address: from })
})

module.exports = {
  mint
}
