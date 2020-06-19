const config = require('config')
const request = require('request-promise-native')
const { toShortName } = require('@utils/network')

const watchAddress = (address) => {
  const url = config.get('blocknative.url')
  return request.post(`${url}/address`, {
    json: true,
    body: {
      address,
      blockchain: 'ethereum',
      networks: [toShortName(config.get(`network.foreign.name`))],
      apiKey: config.get('blocknative.apiKey')
    }
  })
}

module.exports = {
  watchAddress
}
