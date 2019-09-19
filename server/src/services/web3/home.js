const { createNetwork } = require('@utils/web3')

const bridgeType = 'home'

module.exports = {
  ...createNetwork(bridgeType)
}
