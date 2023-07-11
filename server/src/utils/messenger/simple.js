
const AWS = require('aws-sdk')

class Messenger {
  constructor ({ queueUrl, sqsArgs, receiveArgs }) {
    this.queueUrl = queueUrl
    this.receiveArgs = receiveArgs
    this.sqs = new AWS.SQS(sqsArgs)
  }

  generateSendParams (msg) {
    return {
      MessageBody: JSON.stringify(msg),
      QueueUrl: this.queueUrl
    }
  }

  async sendMessage (msg) {
    const params = this.generateSendParams(msg)
    const response = await this.sqs.sendMessage(params).promise()
    return response
  }

  async receiveMessage () {
    console.log('Waiting for messages')
    const params = {
      QueueUrl: this.queueUrl,
      ...this.receiveArgs
    }

    const response = await this.sqs.receiveMessage(params).promise()
    if (response.Messages) {
      const message = response.Messages[0]
      console.log(`message with id ${message.MessageId} received`)
      return { ...message, Body: JSON.parse(message.Body) }
    }
    console.log('no new messages found')
  }

  async deleteMessage ({ ReceiptHandle, MessageId }) {
    console.log(`deleting message ${ReceiptHandle}`)
    const params = {
      QueueUrl: this.queueUrl,
      ReceiptHandle
    }
    try {
      const response = await this.sqs.deleteMessage(params).promise()
      return response
    } catch (error) {
      console.log(`Failing to delete message ${MessageId}`)
      console.error(error)
    }
  }

  async delayMessage ({ ReceiptHandle }, delayTimeout) {
    console.log(`deleting message ${ReceiptHandle}`)

    var params = {
      QueueUrl: this.queueUrl,
      ReceiptHandle,
      VisibilityTimeout: delayTimeout
    }

    const response = await this.sqs.changeMessageVisibility(params).promise()
    return response
  }
}

module.exports = Messenger
