const { handleReceipt } = require('@events/handlers')
const CommunityTransferManagerABI = require('@fuse/entities-contracts/build/abi/CommunityTransferManagerWithEvents')

const CommunityTransferManagerBytecode = require('@fuse/entities-contracts/build/bytecode/CommunityTransferManager')
const { combineRoles, roles: { ADMIN_ROLE, USER_ROLE, APPROVED_ROLE } } = require('@fuse/roles')

const deployCommunity = async ({ home: { createContract, createMethod, send, from } }, communityProgress) => {
  const { name, isClosed, adminAddress } = communityProgress.steps.community.args
  const method = createMethod(createContract(CommunityTransferManagerABI), 'deploy', { data: CommunityTransferManagerBytecode, arguments: [name] })

  const transferManagerContract = await send(method, {
    from
  })

  const communityAddress = transferManagerContract.address

  const communityMethods = []

  if (isClosed) {
    communityMethods.push(createMethod(transferManagerContract, 'addRule', APPROVED_ROLE, APPROVED_ROLE))
  }
  const adminMultiRole = combineRoles(USER_ROLE, ADMIN_ROLE, APPROVED_ROLE)

  const addEntityMethod = createMethod(transferManagerContract, 'addEntity', adminAddress, adminMultiRole)
  communityMethods.push(addEntityMethod)

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
