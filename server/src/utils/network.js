const config = require('config')

const network = config.get('web3.network')

const getAddresses = () => require(`../constants/addresses/${network}.js`)

module.exports = {
  getAddresses
}
