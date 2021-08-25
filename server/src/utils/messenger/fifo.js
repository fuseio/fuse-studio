
const Messenger = require('./simple')
const { get } = require('lodash')
const crypto = require('crypto')

const generateDeduplicationId = () => crypto.randomBytes(64).toString('hex')

const makeMessageGroupId = msg => {
  const { name } = msg
  const bridgeType = get(msg, 'params.bridgeType', 'home')
  return `${name}-${bridgeType}`
}

class FIFOMessenger extends Messenger {
  constructor ({ queueUrl, sqsArgs, receiveArgs, makeMessageGroupId }) {
    super({ queueUrl, sqsArgs, receiveArgs })
    this.makeMessageGroupId = makeMessageGroupId
  }

  generateSendParams (msg) {
    return {
      MessageBody: JSON.stringify(msg),
      QueueUrl: this.queueUrl,
      MessageGroupId: makeMessageGroupId(msg),
      MessageDeduplicationId: get(msg, 'params.correlationId') || generateDeduplicationId()
    }
  }
}

module.exports = FIFOMessenger
