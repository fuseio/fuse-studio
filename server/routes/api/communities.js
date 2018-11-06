const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const utils = require('../../utils/events')
const paginate = require('express-paginate')

router.get('/', async (req, res, next) => {
  const [ results, itemCount ] = await Promise.all([
    Community.find({}).limit(req.query.limit).skip(req.skip),
    Community.count({})
  ])

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results
  })
})

router.get('/owner/:address', async (req, res) => {
  const owner = req.params.address
  const results = await Community.find({owner})

  res.json({
    object: 'list',
    data: results
  })
})

router.get('/:address', async (req, res, next) => {
  const ccAddress = req.params.address
  const community = await Community.findOne({ ccAddress })
  return res.json({ data: community })
})

router.post('/', async (req, res, next) => {
  const { receipt } = req.body.community
  await utils.processTokenCreatedEvent(receipt.events.TokenCreated)
  return res.json({})
})

module.exports = router
