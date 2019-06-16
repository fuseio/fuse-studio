const paginate = require('express-paginate')
const router = require('express').Router()
const mongoose = require('mongoose')
const Entity = mongoose.model('Entity')
const metadataUtils = require('@utils/metadata')
const { upsertUser } = require('@utils/usersRegistry')
const { getMetadata } = require('@utils/metadata')

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

/**
 * @api {get} /entities/:communityAddress/:account Fetch entity by community address and account
 * @apiName GetEntity
 * @apiGroup Entity
 *
 * @apiParam {String} communityAddress Community address
 * @apiParam {String} account Entity's account address
 *
 * @apiSuccess {String} account
 * @apiSuccess {String} communityAddress
 * @apiSuccess {String} uri IPFS URI points to entities metadata
 * @apiSuccess {String} name
 * @apiSuccess {String} roles byte array on entity's roles
 * @apiSuccess {String} type entity's type - user/business
 * @apiSuccess {Boolean} isAdmin
 * @apiSuccess {Boolean} isApproved
 */
router.get('/:communityAddress/:account', async (req, res, next) => {
  const { account, communityAddress } = req.params
  const entity = await Entity.findOne({ account, communityAddress })

  return res.json({ data: entity })
})

const getQueryFilter = ({ query: { type }, params: { communityAddress } }) =>
  type ? { type, communityAddress } : { communityAddress }

/**
 * @api {get} /entities/:communityAddress Fetch entities by community address
 * @apiName GetEntities
 * @apiGroup Entity
 *
 * @apiParam {String} communityAddress Community address
 * @apiParam {Number} page Page number for pagination
 * @apiParam {Boolean} withMetadata Get entitites with entity's metadata
 *
 * @apiSuccess {Object[]} -   List of entities. See GetEntity endpoint for entity fields
 */
router.get('/:communityAddress', async (req, res, next) => {
  const queryFilter = getQueryFilter(req)
  const { withMetadata } = req.query

  let [ results, itemCount ] = await Promise.all([
    Entity.find(queryFilter).sort({ name: 1 }).limit(req.query.limit).skip(req.skip),
    Entity.countDocuments(queryFilter)
  ])

  if (withMetadata) {
    const metadatas = await Promise.all(results.map(result => result.uri ? getMetadata(result.uri.split('://')[1]).catch(console.error) : null))
    results = results.map((result, index) => ({ ...result.toObject(), metadata: metadatas[index] && metadatas[index].data }))
  }

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results
  })
})

module.exports = router
