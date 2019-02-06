const jwt = require('express-jwt')
const config = require('config')

const secret = config.get('api.secret')

var auth = {
  required: jwt({
    secret: secret,
    credentialsRequired: true
  }),
  optional: jwt({
    secret: secret,
    credentialsRequired: false
  })
}

module.exports = auth
