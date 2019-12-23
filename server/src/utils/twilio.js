const config = require('config')
const client = require('twilio')(config.get('twilio.accountSid'), config.get('twilio.authToken'))

const verify = ({ phoneNumber }) => {
  if (phoneNumber.endsWith(config.get('twilio.magic'))) {
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
  if (phoneNumber.endsWith(config.get('twilio.magic'))) {
    console.log(`Using "magic" phoneNumber ${phoneNumber} for verifyCheck`)
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
  if (to.endsWith(config.get('twilio.magic'))) {
    console.log(`Using "magic" phoneNumber ${to} for createMessage`)
    return
  }

  client.messages.create({
    from: 'Fuse',
    to: to,
    body: body
  }, (err, result) => {
    if (err) {
      throw err
    }
  })
}

module.exports = {
  verify,
  verifyCheck,
  createMessage
}
