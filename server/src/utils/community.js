const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')
const Community = mongoose.model('Community')
const { handleReceipt } = require('@events/handlers')
const { web3, from, send } = require('@services/web3/home')
const CommunityTransferManagerABI = require('@fuse/entities-contracts/build/abi/CommunityTransferManagerWithEvents')

const IRestrictedTokenABI = require('@constants/abi/IRestrictedToken')
const CommunityTransferManagerBytecode = require('@fuse/entities-contracts/build/bytecode/CommunityTransferManager')
const { combineRoles, roles: { ADMIN_ROLE, USER_ROLE, APPROVED_ROLE } } = require('@fuse/roles')

const deployCommunity = async (token, step) => {
  console.log('Deploying community transfer manager')

  const method = new web3.eth.Contract(CommunityTransferManagerABI).deploy({ data: CommunityTransferManagerBytecode })
  const transferManagerContract = await send(method, {
    from
  })

  const entitiesListAddress = await transferManagerContract.methods.entitiesList().call()

  const communityAddress = transferManagerContract._address

  const { homeTokenAddress } = await Bridge.findOne({ foreignTokenAddress: token.address })

  new Community({
    communityAddress,
    entitiesListAddress,
    tokenAddress: token.address,
    homeTokenAddress
  }).save()

  const communityMethods = []

  if (step.isClosed) {
    communityMethods.push(transferManagerContract.methods.addRule(APPROVED_ROLE, APPROVED_ROLE))
  }
  const adminMultiRole = combineRoles(USER_ROLE, ADMIN_ROLE, APPROVED_ROLE)

  communityMethods.push(
    transferManagerContract.methods.addEntity(token.owner, adminMultiRole))

  for (let method of communityMethods) {
    const receipt = await send(method, { from })
    await handleReceipt(receipt)
  }

  const setTransferManagerMethod = new web3.eth.Contract(IRestrictedTokenABI, homeTokenAddress).methods.setTransferManager(communityAddress)
  await send(setTransferManagerMethod, {
    from
  })
}

module.exports = {
  deployCommunity
}
