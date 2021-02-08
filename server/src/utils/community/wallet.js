const config = require('config')
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const { get } = require('lodash')
const homeAddresses = config.get('network.home.addresses')

const getWalletModules = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress })
  return get(community, 'plugins.slimWallet.walletModules', homeAddresses.walletModules)
}

module.exports = {
  getWalletModules
}
