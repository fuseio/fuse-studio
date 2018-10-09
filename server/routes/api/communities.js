const router = require('express').Router()
const mongoose = require('mongoose')
const paginate = require('express-paginate')

const Community = mongoose.model('Community')

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

router.get('/:address', async (req, res, next) => {
  const address = req.params.address
  const community = await Community.findOne({address})
  return res.json({data: community})
})

router.post('/', async (req, res, next) => {
  const community = new Community({...req.body.community, verified: false})
  await community.save()
  return res.json({data: community})
})

module.exports = router
