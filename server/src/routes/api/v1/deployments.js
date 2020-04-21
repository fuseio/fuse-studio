const router = require('express').Router()
const mongoose = require('mongoose')
const CommunityProgress = mongoose.model('CommunityProgress')
const { agenda } = require('@services/agenda')

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

router.post('/', async (req, res, next) => {
  const { steps, correlationId } = req.body
  const communityProgress = await new CommunityProgress({ steps }).save()

  agenda.now('deploy', { communityProgressId: communityProgress._id, correlationId })
  return res.json({ data: communityProgress })
})

module.exports = router
