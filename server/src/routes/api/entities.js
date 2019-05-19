const paginate = require('express-paginate')
const router = require('express').Router()
const mongoose = require('mongoose')
const Entity = mongoose.model('Entity')
const metadataUtils = require('@utils/metadata')
const { upsertUser } = require('@utils/usersRegistry')

router.put('/:communityAddress/:account', async (req, res) => {
  const { account, communityAddress } = req.params
  const { name } = req.body.metadata
  const { hash } = await metadataUtils.createMetadata(req.body.metadata)
  const uri = `ipfs://${hash}`

  try {
    await upsertUser(account, uri)
  } catch (err) {
    console.log('user cannot be added to User Registry')
    throw err
  }

  const entity = await Entity.findOneAndUpdate({ account, communityAddress }, { uri, name }, { new: true, upsert: true })
  return res.json({ data: entity })
})

router.get('/:communityAddress/:account', async (req, res, next) => {
  const { account, communityAddress } = req.params
  const entity = await Entity.findOne({ account, communityAddress })

  return res.json({ data: entity })
})

const getQueryFilter = ({ query: { type }, params: { communityAddress } }) =>
  type ? { type, communityAddress } : { communityAddress }

router.get('/:communityAddress', async (req, res, next) => {
  const queryFilter = getQueryFilter(req)

  let [ results, itemCount ] = await Promise.all([
    Entity.find(queryFilter).sort({ name: 1 }).limit(req.query.limit).skip(req.skip),
    Entity.countDocuments(queryFilter)
  ])

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results
  })
})

module.exports = router
