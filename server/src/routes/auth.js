const jwt = require('express-jwt')
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const UserAccount = mongoose.model('UserAccount')
const { ObjectId } = mongoose.Types

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
auth.subscriptionService = [auth.required, (req, res, next) => req.user.role === 'subscription-service' ? next() : res.status(403).send({ error: 'The user does not have the required role' })]
auth.userInfo = [auth.required, (req, res, next) => req.user.role === 'user-info' ? next() : res.status(403).send({ error: 'User not authorized' })]

const communityOwner = async (req, res, next) => {
  const { communityAddress } = req.params
  if (!communityAddress) {
    return res.status(403).send({ error: 'Community address is not provided' })
  }

  const community = await Community.findOne({ communityAddress })
  if (!community) {
    return res.status(403).send({ error: `No community exists with address ${communityAddress}` })
  }

  const userAccount = await UserAccount.findOne({ studioUser: ObjectId(req.user.id), accountAddress: community.creatorAddress })
  if (!userAccount) {
    return res.status(403).send({ error: `The user could not be found by ${req.user.id} and community owner account address of ${community.creatorAddress}` })
  }
  req.userAccount = userAccount
  next()
}

auth.communityOwner = [auth.required, communityOwner]

module.exports = auth
