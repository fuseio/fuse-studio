const config = require('config')
const client = require('twilio')(config.get('twilio.accountSid'), config.get('twilio.authToken'))

const verify = ({ phoneNumber }) => {
  return client.verify.services(config.get('twilio.serviceSid'))
    .verifications
    .create({
      to: phoneNumber,
      channel: 'sms'
    })
}

const verifyCheck = ({ phoneNumber, code }) => {
  return client.verify.services(config.get('twilio.serviceSid'))
    .verificationChecks
    .create({
      to: phoneNumber,
      code
    })
}

const createMessage = ({ to, body }) => {
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
