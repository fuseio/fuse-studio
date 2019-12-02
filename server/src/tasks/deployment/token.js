const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const { handleReceipt } = require('@handlers/receipts')

const transferOwnership = async ({ home: { createContract, createMethod, send, from } }, communityProgress) => {
  const { homeTokenAddress } = communityProgress.steps.bridge.results
  const { adminAddress } = communityProgress.steps.community.args

  const tokenContractInstance = createContract(BasicTokenAbi, homeTokenAddress)

  const method = createMethod(tokenContractInstance, 'transferOwnership', adminAddress)

  const receipt = await send(method, {
    from
  })

  await handleReceipt(receipt)

  return { owner: adminAddress }
}

module.exports = {
  transferOwnership
}
