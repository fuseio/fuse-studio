const config = require('config')
const AWS = require('aws-sdk')
const mongoose = require('mongoose')
const PhoneVerification = mongoose.model('PhoneVerification')
const { isMagic } = require('./common')

AWS.config.update({ region: config.get('aws.sns.region') })

const publishMessage = ({ phoneNumber, body }) => {
  const publishPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish({
    PhoneNumber: phoneNumber,
    Message: body,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': { DataType: 'String', StringValue: config.get('aws.sns.senderId') },
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: config.get('aws.sns.smsType') }
    }
  }).promise()

  publishPromise
    .then(data => {
      console.log(`publishMessage: ${JSON.stringify(data)}`)
      return data
    })
    .catch(err => {
      throw err
    })
}

const verify = async ({ phoneNumber }) => {
  if (isMagic(phoneNumber)) {
    console.log(`Using "magic" phoneNumber ${phoneNumber} for verify`)
    return
  }

  const existingVerification = await PhoneVerification.findOne({ phoneNumber, verified: false })
  let code
  if (existingVerification) {
    code = existingVerification.code
    await PhoneVerification.updateOne({ phoneNumber, code }, { count: existingVerification.count + 1 })
  } else {
    code = Math.floor(Math.random() * 100000) + 99999
    await new PhoneVerification({ phoneNumber, code }).save()
  }

  return publishMessage({ phoneNumber, body: `Your verification code is: ${code}` })
}

const verifyCheck = async ({ phoneNumber, code }) => {
  if (isMagic(phoneNumber)) {
    console.log(`Using "magic" phoneNumber ${phoneNumber} for verifyCheck with code ${code}`)
    return code === '111111' ? { status: 'approved' } : {}
  }

  const existingVerification = await PhoneVerification.findOne({ phoneNumber, code, verified: false })
  if (existingVerification) {
    await PhoneVerification.updateOne({ phoneNumber, code }, { verified: true })
    return { status: 'approved' }
  } else {
    return {}
  }
}

const createMessage = ({ to, body }) => {
  if (isMagic(to)) {
    console.log(`Using "magic" phoneNumber ${to} for createMessage with body ${body}`)
    return
  }

  try {
    publishMessage({ phoneNumber: to, body })
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  verify,
  verifyCheck,
  createMessage
}
