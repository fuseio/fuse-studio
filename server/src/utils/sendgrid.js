const client = require('@services/sendgrid')
const config = require('config')
const { capitalize } = require('lodash')

const createMailRequest = ({ to, from, templateId, templateData, bcc }) => {
  return {
    method: 'POST',
    url: '/v3/mail/send',
    body: {
      'personalizations': [
        {
          'to': Array.isArray(to) ? to : [
            {
              'email': to
            }
          ],
          'bcc': bcc,
          'dynamic_template_data': templateData
        }
      ],
      'from': {
        'email': from,
        'name': 'Fuse.io'
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

const sendInfoMail = async (user, { communityName, communityAddress }) => {
  const env = config.get('env')
  const API_ROOT = 'https://studio{env}.fuse.io/view/community/'
  const domain = API_ROOT.replace('{env}', env === 'qa' ? '-qa' : '')
  const networkType = capitalize(config.get(`network.foreign.name`))
  const templateData = {
    communityName,
    networkType,
    communityLink: domain + communityAddress + '/justCreated',
    fuseExplorer: 'https://explorer.fuse.io/address/' + communityAddress + '/transactions',
    communityAddress
  }

  const managers = (config.get('mail.managers') || []).map((email) => ({ email }))

  const request = createMailRequest({
    to: user.email,
    from: config.get('mail.supportAddress'),
    templateId: config.get('mail.sendgrid.templates.communityLaunched'),
    bcc: managers,
    templateData
  })

  const [response] = await client.request(request)
  if (response.statusCode >= 400) {
    throw Error(`Cannot send welcome email to ${user.email}`)
  }
}

const notifyManagers = async ({ formData, networkType }) => {
  const { communityName, description, accountAddress, email } = formData
  console.log(`notifying managers about new user with ${email} email`)
  const managers = (config.get('mail.managers') || []).map((email) => ({ email }))
  const templateData = {
    communityName,
    description,
    accountAddress,
    email,
    networkType: capitalize(networkType)
  }

  const request = createMailRequest({
    to: managers,
    from: config.get('mail.supportAddress'),
    templateId: config.get('mail.sendgrid.templates.notifyManagers'),
    templateData
  })

  const [response] = await client.request(request)

  if (response.statusCode >= 400) {
    console.error(`Cannot send welcome email to ${managers}`)
  }
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

const sendUserInvitationToCommunity = async ({ email, url }) => {
  const request = {
    method: 'POST',
    url: '/v3/mail/send',
    body: {
      'personalizations': [
        {
          'to': [{ 'email': email }],
          'subject': 'Invitation to community in Fuse'
        }
      ],
      'from': {
        'email': config.get('mail.supportAddress'),
        'name': 'Fuse.io'
      },
      'content': [
        {
          'type': 'text/plain',
          'value': `
            ${config.get('inviteTxtEmail')}
            ${url}
          `
        }
      ]
    }
  }
  const [response] = await client.request(request)
  if (response.statusCode >= 400) {
    throw Error(`Cannot send invitation to email - ${email}`)
  }
  console.log(`send invitation to email - ${email}`)
}

module.exports = {
  sendWelcomeMail,
  subscribeUser,
  sendInfoMail,
  notifyManagers,
  sendUserInvitationToCommunity
}
