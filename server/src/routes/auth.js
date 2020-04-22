const jwt = require('express-jwt')
const config = require('config')

const secret = config.get('api.secret')

var auth = {
  required: jwt({ secret: secret, credentialsRequired: true }), // block if no jwt
  optional: jwt({ secret: secret, credentialsRequired: false }) // allow if no jwt, but can use jwt data if exists
}

module.exports = auth
