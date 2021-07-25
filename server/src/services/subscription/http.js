const config = require('config')
const request = require('request-promise-native')

console.log(`Loading HTTP subscription service transport`)

const subscribeAddress = (address, eventName = 'erc20-transfers-to') => {
  const url = config.get('subscriptionServices.fuse.url')
  return request.post(`${url}/subscribe/${eventName}`, {
    json: true,
    body: {
      address,
      webhookUrl: config.get('subscriptionServices.fuse.webhookUrl')
    }
  })
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
  subscribeToSubscriptionService
}
