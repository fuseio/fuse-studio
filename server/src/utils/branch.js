const config = require('config')
const request = require('request')

const createDeepLink = ({ communityAddress }) => {
  return new Promise((resolve, reject) => {
    request.post(`${config.get('branch.urlBase')}url`, {
      json: true,
      body: {
        'branch_key': config.get('branch.key'),
        'campaign': 'switch_community',
        'channel': 'mobile',
        'feature': 'switch_community',
        'marketing_title': 'admin invite user',
        'marketing': true,
        'data': {
          'community_address': communityAddress
        }
      }
    }, (err, response, body) => {
      if (err) {
        throw err
      }
      resolve(body)
    })
  })
}

module.exports = {
  createDeepLink
}
