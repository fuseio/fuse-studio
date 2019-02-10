const config = require('config')

const network = config.get('web3.network')

const addresses = config.get(`web3.addresses.${network}`)

module.exports = {
  addresses
}
