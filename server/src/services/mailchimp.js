const Mailchimp = require('mailchimp-api-v3')
const config = require('config')

const mailchimp = new Mailchimp(config.get('mail.mailchimp.apiKey'))

module.exports = mailchimp
