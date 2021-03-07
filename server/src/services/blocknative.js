const config = require('config')
const request = require('request-promise-native')
const { toShortName } = require('@utils/network')

const watchAddress = (address) => {
  const url = config.get('subscriptionServices.blocknative.url')
  return request.post(`${url}/address`, {
    json: true,
    body: {
      address,
      blockchain: 'ethereum',
      networks: [toShortName(config.get(`network.foreign.name`))],
      apiKey: config.get('subscriptionServices.blocknative.apiKey')
    }
  })
}

const subscribeAddress = (address, eventName = 'erc20-transfers-to') => {
  const url = config.get('subscriptionServices.fuse.url')
  return request.post(`${url}/subscribe/wallet/${eventName}`, {
    json: true,
    body: {
      address,
      webhookUrl: config.get('subscriptionServices.fuse.webhookUrl')
    }
  })
}

module.exports = {
  watchAddress,
  subscribeAddress
}
