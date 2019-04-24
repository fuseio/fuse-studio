const router = require('express').Router()
const mongoose = require('mongoose')
const Business = mongoose.model('Business')
const paginate = require('express-paginate')
const {getMetadata} = require('@utils/metadata')

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
  const {withMetadata} = req.query

  let [ results, itemCount ] = await Promise.all([
    Business.find(queryFilter).sort({name: 1}).limit(req.query.limit).skip(req.skip).lean(),
    Business.estimatedDocumentCount({})
  ])

  const pageCount = Math.ceil(itemCount / req.query.limit)

  if (withMetadata) {
    const metadatas = await Promise.all(results.map(result => getMetadata(result.hash).catch(console.error)))
    results = results.map((result, index) => ({...result, metadata: metadatas[index] && metadatas[index].data}))
  }

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results
  })
})

router.get('/:listAddress/:hash', async (req, res, next) => {
  const {listAddress, hash} = req.params
  const {withMetadata} = req.query
  const business = await Business.findOne({ listAddress, hash }).lean()

  if (withMetadata) {
    const metadata = await getMetadata(business.hash).catch(console.error)
    return res.json({data: {...business, metadata: metadata && metadata.data}})
  } else {
    return res.json({ data: business })
  }
})

module.exports = router
