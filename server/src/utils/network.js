const request = require('request-promise-native')
const config = require('config')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const isZeroAddress = (address) => address === ZERO_ADDRESS

const fetchGasPrice = async (speed) => {
  const url = config.get('network.foreign.gasStation')
  const response = JSON.parse(await request.get(url))
  const gas = response[speed]
  // special treatment for https://ethgasstation.info/
  if (url.includes('ethgasstation')) {
    return gas / 10
  }
  return gas
}

export const toShortName = (networkType) => networkType === 'mainnet' ? 'main' : networkType

module.exports = {
  isZeroAddress,
  fetchGasPrice
}
