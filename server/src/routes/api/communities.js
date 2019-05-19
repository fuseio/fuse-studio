const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')

router.get('/', async (req, res, next) => {
  const { tokenAddress } = req.query
  const community = await Community.findOne({ tokenAddress }).lean()
  return res.json({ data: community })
})

router.get('/:communityAddress', async (req, res, next) => {
  const { listAddress } = req.params
  const community = await Community.findOne({ listAddress }).lean()
  return res.json({ data: community })
})

module.exports = router
