
const config = require('config')
const { get } = require('lodash')
const queueUrl = config.get('aws.sqs.queueUrl')
const { FIFOMessenger } = require('@utils/messenger')
const sqsArgs = config.get('aws.sqs.constructor')
const receiveArgs = config.get('aws.sqs.receive')

const makeMessageGroupId = msg => {
  const { name } = msg
  const bridgeType = get(msg, 'params.bridgeType', 'home')
  return `${name}-${bridgeType}`
}

const tasksFIFOMessenger = new FIFOMessenger({ queueUrl, sqsArgs, receiveArgs, makeMessageGroupId })

module.exports = {
  tasksFIFOMessenger
}
