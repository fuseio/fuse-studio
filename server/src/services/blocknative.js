const config = require('config')
const request = require('request-promise-native')

const watchAddress = (address) => {
  const url = config.get('blocknative.url')
  return request.post(`${url}/address`, {
    json: true,
    body: {
      address,
      blockchain: 'ethereum',
      networks: [config.get(`network.foreign.name`)],
      apiKey: config.get('blocknative.apiKey')
    }
  })
}

module.exports = {
  watchAddress
}
