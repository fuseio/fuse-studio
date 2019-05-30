const home = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/build/abi/BasicToken')
const { handleReceipt } = require('@events/handlers')

const transferOwnership = async (communityProgress) => {
  const { homeTokenAddress } = communityProgress.steps.bridge.results
  const { adminAddress } = communityProgress.steps.community.args

  const tokenContractInstance = new home.web3.eth.Contract(BasicTokenAbi, homeTokenAddress)

  const method = tokenContractInstance.methods.transferOwnership(adminAddress)

  const receipt = await home.send(method, {
    from: home.from
  })

  await handleReceipt(receipt)

  return { owner: adminAddress }
}

module.exports = {
  transferOwnership
}
