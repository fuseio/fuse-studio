module.exports = {
  FuseToken: require('./FuseToken'),
  TokenFactory: require('@fuse/token-factory-contracts/abi/TokenFactoryWithEvents'),
  BridgeMapper: require('./BridgeMapper'),
  BasicToken: require('@fuse/token-factory-contracts/abi/BasicToken'),
  BasicForeignBridge: require('./BasicForeignBridge'),
  BasicHomeBridge: require('./BasicHomeBridge'),
  Community: require('@fuse/entities-contracts/abi/CommunityWithEvents'),
  IRestrictedToken: require('./IRestrictedToken'),
  CommunityTransferManager: require('@fuse/entities-contracts/abi/CommunityTransferManager')
}
