const request = require('request-promise-native')
const config = require('config')

const network = config.get('web3.network')

const addresses = config.get(`web3.addresses.${network}`)

const fetchGasPrice = async (speed) => {
  const url = config.get('web3.gasStation')
  const response = JSON.parse(await request.get(url))
  return response[speed]
}

module.exports = {
  addresses,
  fetchGasPrice
}
