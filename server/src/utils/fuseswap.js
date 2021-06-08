const request = require('request-promise-native')
const config = require('config')

const fetchTokenPrice = async (tokenAddress) => {
  const response = await request.get(`${config.get('fuseswap.api.url')}/price/${tokenAddress}`)
  const { data } = JSON.parse(response)
  return data.price
}

module.exports = {
  fetchTokenPrice
}
