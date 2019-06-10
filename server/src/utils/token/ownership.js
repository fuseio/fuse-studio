const { createContract, createMethod, send, from } = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/build/abi/BasicToken')
const { handleReceipt } = require('@events/handlers')

const transferOwnership = async (communityProgress) => {
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
