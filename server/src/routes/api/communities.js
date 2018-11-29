const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const paginate = require('express-paginate')

router.get('/', async (req, res, next) => {
  const [ results, itemCount ] = await Promise.all([
    Community.find({}).sort({openMarket: -1, blockNumber: -1}).limit(req.query.limit).skip(req.skip),
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
  const results = await Community.find({ owner }).sort({ blockNumber: -1 })

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

module.exports = router
