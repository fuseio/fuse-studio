const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const CommunityProgress = mongoose.model('CommunityProgress')
const deploy = require('@utils/deploy')

router.get('/', async (req, res, next) => {
  const { tokenAddress } = req.query
  const community = await Community.findOne({ tokenAddress }).lean()
  return res.json({ data: community })
})

router.get('/progress/:id', async (req, res, next) => {
  const { id } = req.params
  const communityProgress = await CommunityProgress.findById(id)
  return res.json({ data: communityProgress })
})

router.get('/progress', async (req, res, next) => {
  const { communityAddress } = req.query
  const communityProgress = await CommunityProgress.findOne({ communityAddress })
  return res.json({ data: communityProgress })
})

router.get('/:communityAddress', async (req, res, next) => {
  const { communityAddress } = req.params
  const community = await Community.findOne({ communityAddress }).lean()
  return res.json({ data: community })
})

router.post('/deploy', async (req, res, next) => {
  const { steps } = req.body
  const communityProgress = await new CommunityProgress({ steps }).save()

  deploy(communityProgress)

  return res.json({ data: communityProgress })
})

module.exports = router
