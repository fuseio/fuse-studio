const client = require('@services/sendgrid')
const { web3 } = require('@services/web3/foreign')
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

const subscribeUser = async (user) => {
  const listId = config.get('mail.sendgrid.listId')
  const request = {
    method: 'PUT',
    url: '/v3/marketing/contacts',
    body: {
      'list_id': [
        listId
      ],
      'contacts':
        [{
          'email': user.email,
          'first_name': user.firstName,
          'last_name': user.lastName
        }]
    }
  }
  const [response] = await client.request(request)
  if (response.statusCode >= 400) {
    throw Error(`Cannot add user ${user.email} to list`)
  }
  console.log(`User ${user.email} subscribed to mail list`)
}

module.exports = {
  sendWelcomeMail,
  subscribeUser
}
