const abiMapping = {
  TokenFactory: () => require('@fuse/token-factory-contracts/build/abi/TokenFactoryWithEvents'),
  BridgeMapper: () => require('./BridgeMapper'),
  BasicToken: () => require('@fuse/token-factory-contracts/build/abi/BasicToken'),
  MintableBurnableToken: () => require('@fuse/token-factory-contracts/build/abi/MintableBurnableToken'),
  BasicForeignBridge: () => require('./BasicForeignBridge'),
  BasicHomeBridge: () => require('./BasicHomeBridge'),
  Community: () => require('@fuse/entities-contracts/build/abi/CommunityWithEvents'),
  IRestrictedToken: () => require('./IRestrictedToken'),
  CommunityTransferManager: () => require('@fuse/entities-contracts/build/abi/CommunityTransferManager')
}

const getAbi = (abiName) => {
  if (abiMapping[abiName]) {
    return abiMapping[abiName]()
  } else {
    throw new Error(`ABI name ${abiName} does not exists`)
  }
}

module.exports = {
  getAbi,
  abiMapping
}
