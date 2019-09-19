const { createNetwork } = require('@utils/web3')

const bridgeType = 'foreign'

module.exports = {
  ...createNetwork(bridgeType)
}
