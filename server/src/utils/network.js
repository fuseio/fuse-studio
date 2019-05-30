const request = require('request-promise-native')
const config = require('config')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const isZeroAddress = (address) => address === ZERO_ADDRESS

const fetchGasPrice = async (speed) => {
  const url = config.get('network.foreign.gasStation')
  const response = JSON.parse(await request.get(url))
  return response[speed]
}

module.exports = {
  isZeroAddress,
  fetchGasPrice
}
