const config = require('config')

const providers = {
  twilio: require('./twilio'),
  sns: require('./awsSNS')
}

module.exports = providers[config.get('smsProvider') || 'sns']
