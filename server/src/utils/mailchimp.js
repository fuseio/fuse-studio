const mailchimp = require('@services/mailchimp')
const config = require('config')

const subscribeUser = async (user) => {
  const listId = config.get('mail.mailchimp.listId')
  const response = await mailchimp.post(`/lists/${listId}/members`, {
    email_address: user.email,
    status: 'subscribed'
  })
  if (response.statusCode >= 400) {
    throw Error(`Cannot add user ${user.email} to list`)
  }
  console.log(`User ${user.email} subscribed to mail list`)
}

module.exports = {
  subscribeUser
}
