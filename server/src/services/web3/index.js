const home = require('./home')
const foreign = require('./foreign')

const networks = {
  home,
  foreign
}

const web3Instances = {
  home: home.web3,
  foreign: foreign.web3
}

const networkTypeToBridgeType = (networkType) => networkType === 'fuse' ? 'home' : 'foreign'

const getWeb3 = ({ bridgeType, networkType }) => {
  if (!bridgeType) {
    return web3Instances[networkTypeToBridgeType(networkType)]
  }
  return web3Instances[bridgeType]
}

const getNetwork = ({ bridgeType }) => networks[bridgeType]

module.exports = {
  getWeb3,
  getNetwork
}
