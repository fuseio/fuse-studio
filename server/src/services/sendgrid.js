const client = require('@sendgrid/client')
const config = require('config')

client.setApiKey(config.get('mail.sendgrid.apiKey'))

module.exports = client
