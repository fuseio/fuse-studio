module.exports = {
  ColuLocalNetwork: require('./ColuLocalNetwork'),
  TokenFactory: require('@fuse/token-factory-contracts/build/abi/TokenFactoryWithEvents'),
  BridgeMapper: require('./BridgeMapper'),
  BasicToken: require('@fuse/token-factory-contracts/build/abi/BasicToken'),
  BasicForeignBridge: require('./BasicForeignBridge'),
  BasicHomeBridge: require('./BasicHomeBridge'),
  Community: require('@fuse/entities-contracts/build/abi/CommunityWithEvents'),
  IRestrictedToken: require('./IRestrictedToken'),
  CommunityTransferManager: require('@fuse/entities-contracts/build/abi/CommunityTransferManager')
}
