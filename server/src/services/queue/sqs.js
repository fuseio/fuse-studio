const AWS = require('aws-sdk')
const config = require('config')

const sqs = new AWS.SQS(config.get('aws.sqs.constructor'))
const queueUrl = config.get('aws.sqs.queueUrl')

const sendMessage = async (msg) => {
  const params = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: queueUrl,
    MessageGroupId: 'jobs'
  }

  const response = await sqs.sendMessage(params).promise()
  // console.log({ response })
  return response
}

const receiveMessage = async () => {
  console.log('Waiting for messages')
  const params = {
    WaitTimeSeconds: 20,
    QueueUrl: queueUrl
  }

  const response = await sqs.receiveMessage(params).promise()
  // console.log({ response })
  return response.Messages && { ...response.Messages[0], Body: JSON.parse(response.Messages[0].Body) }
}

const deleteMessage = async ({ ReceiptHandle }) => {
  console.log(`deleting message ${ReceiptHandle}`)
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle
  }

  const response = await sqs.deleteMessage(params).promise()
  // console.log({ response })

  return response
}

// const flow = async () => {
//   await sendMessage({ name: 'createWallet',
//     params: {
//       address: '0x123',
//       name: 'leon5',
//       contracts: [
//       ]
//     }
//   })
//   const message = await receiveMessage()
//   if (message) {
//     console.log({ message })
//     await deleteMessage(message)
//   }
// }

// flow()
// receiveMessage()

module.exports = {
  sendMessage,
  receiveMessage,
  deleteMessage
}
