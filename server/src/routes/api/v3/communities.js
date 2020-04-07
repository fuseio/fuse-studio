const router = require('express').Router()
const _ = require('lodash')
const mongoose = require('mongoose')
const CommunityDetail = mongoose.model('CommunityDetail')
const BridgedToken = mongoose.model('BridgedToken')
const Account = mongoose.model('Account')

// TODO add auth.required on relevant routes

router.post('/', async (req, res, next) => {
  const bridgedToken = await BridgedToken.findOne({ _id: req.body.bridgedToken })
  if (!bridgedToken) {
    return res.status(400).json({ error: 'Invalid BridgedToken' })
  }
  // TODO set community owner Account before/after creation
  const community = await new CommunityDetail(req.body).save()
  res.send({ data: community })
})

router.get('/id/:id', async (req, res, next) => {
  const community = await CommunityDetail.findOne({ _id: req.params.id })
  if (!community) {
    return res.status(404).json({ error: 'Community not found' })
  }
  res.send({ data: community })
})

router.get('/bridgedToken/:bridgedTokenId', async (req, res, next) => {
  const community = await CommunityDetail.findOne({ bridgedToken: req.params.bridgedTokenId })
  if (!community) {
    return res.status(404).json({ error: 'Community not found' })
  }
  res.send({ data: community })
})

router.get('/owner/:ownerId', async (req, res, next) => {
  const communities = await CommunityDetail.find({ owner: req.params.ownerId })
  if (!communities || communities.length === 0) {
    return res.status(404).json({ error: `${req.params.ownerId} has no communities` })
  }
  res.send({ data: communities })
})

router.put('/:id', async (req, res, next) => {
  const { description, webpageURL } = req.body
  const community = await CommunityDetail.findOneAndUpdate({ _id: req.params.id }, _.pickBy({ description, webpageURL }, _.identity), { new: true })
  if (!community) {
    return res.status(404).json({ error: 'Community not found' })
  }
  res.send({ data: community })
})

module.exports = router
