const AWS = require('aws-sdk')
const config = require('config')
const crypto = require('crypto')
const { get } = require('lodash')
const sqs = new AWS.SQS(config.get('aws.sqs.constructor'))
const queueUrl = config.get('aws.sqs.queueUrl')

const makeMessageGroupId = msg => {
  const { name } = msg
  const bridgeType = get(msg, 'params.bridgeType', 'home')
  return `${name}-${bridgeType}`
}

const generateDeduplicationId = () => crypto.randomBytes(64).toString('hex')

const sendMessage = async (msg) => {
  const params = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: queueUrl,
    MessageGroupId: makeMessageGroupId(msg),
    MessageDeduplicationId: get(msg, 'params.correlationId') || generateDeduplicationId()
  }

  const response = await sqs.sendMessage(params).promise()
  return response
}

const receiveMessage = async () => {
  console.log('Waiting for messages')
  const params = {
    QueueUrl: queueUrl,
    ...config.get('aws.sqs.receive')
  }

  const response = await sqs.receiveMessage(params).promise()
  if (response.Messages) {
    const message = response.Messages[0]
    console.log(`message with id ${message.MessageId} recieved`)
    return { ...message, Body: JSON.parse(message.Body) }
  }
  console.log('no new messages found')
}

const deleteMessage = async ({ ReceiptHandle }) => {
  console.log(`deleting message ${ReceiptHandle}`)
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle
  }

  const response = await sqs.deleteMessage(params).promise()

  return response
}

module.exports = {
  sendMessage,
  receiveMessage,
  deleteMessage
}
