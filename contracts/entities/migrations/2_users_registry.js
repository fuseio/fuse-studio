const UsersRegistry = artifacts.require('UsersRegistry')

module.exports = function (deployer) {
  deployer.deploy(UsersRegistry)
}
