const AWS = require('aws-sdk')
const config = require('config')
const sqs = new AWS.SQS(config.get('aws.sqs.constructor'))
const queueUrl = config.get('subscriptionServices.fuse.queueUrl')

console.log(`Loading SQS subscription service transport`)

const sendMessage = async (msg) => {
  const params = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: queueUrl
  }

  const response = await sqs.sendMessage(params).promise()
  return response
}

const subscribeAddress = (subscribedAddress, extraData, eventName = 'erc20-transfers-to') => {
  return sendMessage({
    ...extraData,
    eventName,
    subscribedAddress,
    webhookUrl: config.get('subscriptionServices.fuse.webhookUrl')
  })
}

const subscribeToSubscriptionService = async (walletAddress, extraData) => {
  try {
    console.log(`Adding the address ${walletAddress} to the subscription service list of fuse`)
    const response = await subscribeAddress({ ...extraData, walletAddress })
    console.log(`address ${walletAddress} was added to the subscription service in message id ${response.MessageId}`)
  } catch (e) {
    console.error(`Failed to the add the address ${walletAddress} to the subscription service list of fuse`)
    console.error(e)
  }
}

module.exports = {
  subscribeAddress,
  subscribeToSubscriptionService
}
