const client = require('@services/sendgrid')
const web3 = require('@services/web3')
const config = require('config')

const createMailRequest = ({ to, from, templateId, templateData }) => {
  return {
    method: 'POST',
    url: '/v3/mail/send',
    body: {
      'personalizations': [
        {
          'to': [
            {
              'email': to
            }
          ],
          'dynamic_template_data': templateData
        }
      ],
      'from': {
        'email': from
      },
      'template_id': templateId
    }
  }
}

const sendWelcomeMail = (user, token) => {
  const from = config.get('mail.supportAddress')
  const to = user.email
  const templateData = {
    name: token.name,
    symbol: token.symbol,
    totalSupply: web3.utils.fromWei(token.totalSupply)
  }
  const templateId = config.get('mail.sendgrid.templates.welcome')
  const request = createMailRequest({ to, from, templateId, templateData })
  client.request(request).then(() => {
    console.log(`Sent welcoming mail to address ${to}, with template data ${JSON.stringify(templateData)}`)
  })
}

const addToList = async (recipientId, listId) => {
  const request = {
    method: 'POST',
    url: `/v3/contactdb/lists/${listId}/recipients/${recipientId}`
  }

  await client.request(request)
}

const addContact = async (user) => {
  const request = {
    method: 'POST',
    url: '/v3/contactdb/recipients',
    body: [{
      'email': user.email,
      'first_name': user.firstName,
      'last_name': user.lastName
    }]
  }
  const body = (await client.request(request))[1]
  const recipientId = body.persisted_recipients[0]
  return recipientId
}

const subscribeUser = async (user) => {
  const recipientId = await addContact(user)
  const listId = config.get('mail.sendgrid.listId')
  await addToList(recipientId, listId)
  console.log(`User ${user.email} subscribed to mail list`)
}

module.exports = {
  sendWelcomeMail,
  subscribeUser
}
