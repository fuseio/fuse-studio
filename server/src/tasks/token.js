const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const { handleReceipt } = require('@handlers/receipts')
const { createNetwork } = require('@utils/web3')
const { withAccount, lockAccount } = require('@utils/account')

const mint = withAccount(async (account, { bridgeType, from, tokenAddress, amount }, job) => {
  const { createContract, createMethod, send } = createNetwork(bridgeType, account)
  const tokenContractInstance = createContract(BasicTokenAbi, tokenAddress)

  const method = createMethod(tokenContractInstance, 'mint', account, amount)

  const receipt = await send(method, {
    from
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })

  await handleReceipt(receipt)
}, ({ from }) => {
  return lockAccount({ address: from })
})

module.exports = {
  mint
}
