const config = require('config')
const { handleReceipt } = require('@handlers/receipts')
const CommunityTransferManagerABI = require('@fuse/entities-contracts/build/abi/CommunityTransferManagerWithEvents')
const CommunityFactoryABI = require('@fuse/entities-contracts/build/abi/CommunityFactory')

const { roles: { ADMIN_ROLE, APPROVED_ROLE, EMPTY_ROLE } } = require('@fuse/roles')

const deployCommunity = async ({ home: { createContract, createMethod, send, from } }, communityProgress) => {
  const { name, isClosed, adminAddress } = communityProgress.steps.community.args
  debugger
  const method = createMethod(createContract(CommunityFactoryABI, config.get('network.home.addresses.CommunityFactory')), 'createCommunity', name, adminAddress)

  const receipt = await send(method, {
    from
  })
  debugger
  const communityAddress = receipt.events.CommunityCreated.returnValues.community
  const transferManagerContract = createContract(CommunityTransferManagerABI, communityAddress)
  const communityMethods = []

  if (isClosed) {
    communityMethods.push(createMethod(transferManagerContract, 'addRule', APPROVED_ROLE, APPROVED_ROLE))
    communityMethods.push(createMethod(transferManagerContract, 'addRule', ADMIN_ROLE, EMPTY_ROLE))
  }

  // const adminMultiRole = combineRoles(USER_ROLE, ADMIN_ROLE, APPROVED_ROLE)

  // const addEntityMethod = createMethod(transferManagerContract, 'addEntity', adminAddress, adminMultiRole)
  // communityMethods.push(addEntityMethod)

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
