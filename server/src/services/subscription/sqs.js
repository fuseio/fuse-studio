const AWS = require('aws-sdk')
const config = require('config')
const sqs = new AWS.SQS(config.get('aws.sqs.constructor'))
const queueUrl = config.get('subscriptionServices.fuse.queueUrl')
const { Messenger } = require('@utils/messenger')
console.log(`Loading SQS subscription service transport`)

const sqsArgs = new AWS.SQS(config.get('aws.sqs.constructor'))
const subscriptionsMessenger = new Messenger({ queueUrl, sqsArgs, receiveArgs, makeMessageGroupId })

const subscribeAddress = (subscribedAddress, extraData, eventName = 'erc20-transfers-to') => {
  return subscriptionsMessenger.sendMessage({
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
