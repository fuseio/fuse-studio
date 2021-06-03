const router = require('express').Router()
const mongoose = require('mongoose')
const CommunityProgress = mongoose.model('CommunityProgress')
const Community = mongoose.model('Community')
const StudioUser = mongoose.model('StudioUser')
const taskManager = require('@services/taskManager')
const auth = require('@routes/auth')
const config = require('config')
const { isNumber } = require('lodash')

router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  const communityProgress = await CommunityProgress.findById(id)
  return res.json({ data: communityProgress })
})

router.get('/', async (req, res, next) => {
  const { communityAddress } = req.query
  const communityProgress = await CommunityProgress.findOne({ communityAddress })
  return res.json({ data: communityProgress })
})

router.post('/', auth.required, async (req, res, next) => {
  const { steps, correlationId } = req.body

  const issuedCommunities = await Community.find({ owner: req.user.id }).count()
  const { communitiesLimit } = await StudioUser.findById(req.user.id)
  const limit = isNumber(communitiesLimit) ? parseInt(communitiesLimit) : config.get('community.limitPerUser')
  if (issuedCommunities >= limit) {
    return res.status(403).json({ error: 'User issued more than the maximum number of communities.' })
  }
  const communityProgress = await new CommunityProgress({ steps }).save()

  taskManager.now('deployEconomy', { communityProgressId: communityProgress._id, correlationId, owner: req.user.id })
  return res.json({ data: communityProgress })
})

module.exports = router
