const CommunityFactory = artifacts.require('CommunityFactory')

module.exports = function (deployer) {
  deployer.deploy(CommunityFactory)
}
