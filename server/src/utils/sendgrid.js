const client = require('@services/sendgrid')
const config = require('config')

const createMailRequest = ({ to, from, templateId }) => {
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
          ]
        }
      ],
      'from': {
        'email': from
      },
      'template_id': templateId
    }
  }
}

const sendWelcomeMail = async (user) => {
  const request = createMailRequest({
    to: user.email,
    from: config.get('mail.supportAddress'),
    templateId: config.get('mail.sendgrid.templates.welcome')
  })

  const [response] = await client.request(request)
  if (response.statusCode >= 400) {
    throw Error(`Cannot send welcome email to ${user.email}`)
  }
}

const sendInfoMail = async (user) => {
  // TODO - send email with all the essential information
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
          'email': user.email
          // 'first_name': user.firstName,
          // 'last_name': user.lastName
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
  subscribeUser,
  sendInfoMail
}
