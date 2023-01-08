const config = require('config')
const request = require('request-promise-native')

console.log(`Loading Charge subscription service`)

const addAddressesToWebhook = (addresses) => {
  const { secretKey, publicApiKey, url, webhookId } = config.get('subscriptionServices.charge')
  return request.post(`${url}?apiKey=${publicApiKey}`, {
    json: true,
    body: {
      addresses: [...addresses],
      webhookId: webhookId
    },
    headers: {
      'API-SECRET': secretKey
    }
  })
}

const subscribeToNotificationService = async (walletAddress) => {
  try {
    console.log(`Adding the address ${walletAddress} to the notification`)
    await addAddressesToWebhook([walletAddress])
  } catch (e) {
    console.error(`Failed to the add the address ${walletAddress} to the notification service`)
    console.error(e)
  }
}

module.exports = {
  subscribeToNotificationService
}
