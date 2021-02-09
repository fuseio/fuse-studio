const config = require('config')
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const { get } = require('lodash')
const homeAddresses = config.get('network.home.addresses')

const getWalletModules = async (communityAddress) => {
  const community = await Community.findOne({ communityAddress })
  if get(community, 'plugins.customWallet.isActive') {
    return get(community, 'plugins.customWallet.walletModules', homeAddresses.walletModules)
  } else {
    return homeAddresses.walletModules
  }
}

module.exports = {
  getWalletModules
}
