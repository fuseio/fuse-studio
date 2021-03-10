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

const subscribeToBlocknative = async (walletAddress) => {
  try {
    console.log(`Adding the address ${walletAddress} to the watch list of blocknative`)
    const response = await watchAddress(walletAddress)
    if (response.msg !== 'success') {
      console.error(`Failed to the add the address ${walletAddress} to the watch list of blocknative`)
      throw new Error(response.msg ? response.msg : response)
    }
  } catch (e) {
    console.error(`Failed to the add the address ${walletAddress} to the watch list of blocknative`)
    console.error(e)
  }
}

const subscribeToSubscriptionService = async (walletAddress) => {
  try {
    console.log(`Adding the address ${walletAddress} to the subscription service list of fuse`)
    const response = await subscribeAddress(walletAddress)
    if (response.message !== 'Successfully subscribed to event') {
      console.error(`Failed to subscribe the address ${walletAddress} to the subscription service list of fuse`)
      throw new Error(response.msg ? response.msg : response)
    }
  } catch (e) {
    console.error(`Failed to the add the address ${walletAddress} to the subscription service list of fuse`)
    console.error(e)
  }
}

module.exports = {
  subscribeAddress,
  subscribeToBlocknative,
  subscribeToSubscriptionService
}
