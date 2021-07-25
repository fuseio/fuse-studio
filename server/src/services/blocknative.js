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

module.exports = {
  subscribeToBlocknative
}
