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

auth.admin = [auth.required, (req, res, next) => req.user.isAdmin ? next() : res.status(403).send({ error: 'The user is not admin' })]

module.exports = auth
