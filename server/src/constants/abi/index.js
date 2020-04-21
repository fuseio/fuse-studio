const abiMapping = {
  TokenFactory: () => require('@fuse/token-factory-contracts/abi/TokenFactoryWithEvents'),
  BridgeMapper: () => require('./BridgeMapper'),
  BasicToken: () => require('@fuse/token-factory-contracts/abi/BasicToken'),
  MintableBurnableToken: () => require('@fuse/token-factory-contracts/abi/MintableBurnableToken'),
  BasicForeignBridge: () => require('./BasicForeignBridge'),
  BasicHomeBridge: () => require('./BasicHomeBridge'),
  Community: () => require('@fuse/entities-contracts/abi/CommunityWithEvents'),
  IRestrictedToken: () => require('./IRestrictedToken'),
  CommunityTransferManager: () => require('@fuse/entities-contracts/abi/CommunityTransferManager'),
  TransferManager: () => require('./TransferManager'),
  ExpirableToken: () => require('@fuse/token-factory-contracts/abi/ExpirableToken')
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
