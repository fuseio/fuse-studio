const config = require('config')
const client = require('twilio')(config.get('twilio.accountSid'), config.get('twilio.authToken'))
const { isMagic } = require('./common')

const verify = ({ phoneNumber }) => {
  if (isMagic(phoneNumber)) {
    console.log(`Using "magic" phoneNumber ${phoneNumber} for verify`)
    return
  }

  return client.verify.services(config.get('twilio.serviceSid'))
    .verifications
    .create({
      to: phoneNumber,
      channel: 'sms'
    })
}

const verifyCheck = ({ phoneNumber, code }) => {
  if (isMagic(phoneNumber)) {
    console.log(`Using "magic" phoneNumber ${phoneNumber} for verifyCheck with code ${code}`)
    return code === '111111' ? { status: 'approved' } : {}
  }

  return client.verify.services(config.get('twilio.serviceSid'))
    .verificationChecks
    .create({
      to: phoneNumber,
      code
    })
}

const createMessage = ({ to, body }) => {
  if (isMagic(to)) {
    console.log(`Using "magic" phoneNumber ${to} for createMessage with body ${body}`)
    return
  }

  client.messages.create({
    from: 'Fuse',
    to: to,
    body: body
  }, (err, result) => {
    if (err) {
      console.error(err)
    }
  })
}

module.exports = {
  verify,
  verifyCheck,
  createMessage
}
