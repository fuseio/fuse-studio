const { handleReceipt } = require('@events/handlers')
const { web3, from, send } = require('@services/web3/home')
const CommunityTransferManagerABI = require('@fuse/entities-contracts/build/abi/CommunityTransferManagerWithEvents')

const CommunityTransferManagerBytecode = require('@fuse/entities-contracts/build/bytecode/CommunityTransferManager')
const { combineRoles, roles: { ADMIN_ROLE, USER_ROLE, APPROVED_ROLE } } = require('@fuse/roles')

const deployCommunity = async (communityProgress) => {
  const { name, isClosed, adminAddress } = communityProgress.steps.community.args
  const method = new web3.eth.Contract(CommunityTransferManagerABI).deploy({ data: CommunityTransferManagerBytecode, arguments: [name] })
  const transferManagerContract = await send(method, {
    from
  })

  const communityAddress = transferManagerContract._address

  const communityMethods = []

  if (isClosed) {
    communityMethods.push(transferManagerContract.methods.addRule(APPROVED_ROLE, APPROVED_ROLE))
  }
  const adminMultiRole = combineRoles(USER_ROLE, ADMIN_ROLE, APPROVED_ROLE)

  communityMethods.push(
    transferManagerContract.methods.addEntity(adminAddress, adminMultiRole))

  for (let method of communityMethods) {
    const receipt = await send(method, { from })
    await handleReceipt(receipt)
  }

  return {
    communityAddress,
    isClosed
  }
}

module.exports = {
  deployCommunity
}
