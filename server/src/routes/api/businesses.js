const router = require('express').Router()
const mongoose = require('mongoose')
const Business = mongoose.model('Business')
const paginate = require('express-paginate')

const getQueryFilter = (req) => {
  const {listAddress} = req.params
  if (req.query.hasOwnProperty('active')) {
    const {active} = req.query
    return {listAddress, active}
  } else {
    return {listAddress}
  }
}
router.get('/:listAddress', async (req, res, next) => {
  const queryFilter = getQueryFilter(req)
  const [ results, itemCount ] = await Promise.all([
    Business.find(queryFilter).sort({name: 1}).limit(req.query.limit).skip(req.skip).lean(),
    Business.estimatedDocumentCount({})
  ])

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results
  })
})

module.exports = router
