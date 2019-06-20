const paginate = require('express-paginate')
const router = require('express').Router()
const mongoose = require('mongoose')
const Entity = mongoose.model('Entity')
const metadataUtils = require('@utils/metadata')
const Community = mongoose.model('Community')
const Token = mongoose.model('Token')
const { sortBy, keyBy } = require('lodash')

const withCommunities = async (entities) => {
  const communityAddresses = entities.map(token => token.communityAddress)
  const communities = await Community.find({ communityAddress: { $in: communityAddresses } })
  const communitiesByTokenAddress = keyBy(communities, 'communityAddress')

  return entities.map((entity) => ({
    ...entity.toObject(),
    community: communitiesByTokenAddress[entity.communityAddress]
      ? communitiesByTokenAddress[entity.communityAddress]
      : undefined
  }))
}

const withTokens = async (entities) => {
  const filtered = entities
    .filter(entity => entity.community && entity.community.homeTokenAddress)
  const homeTokenAddresses = filtered.map(entity => entity.community.homeTokenAddress)

  const tokens = await Token.find({ address: { $in: homeTokenAddresses } })

  const communitiesByTokenAddress = keyBy(tokens, 'address')

  return filtered.map((entity) => ({
    ...entity,
    token: communitiesByTokenAddress[entity.community.homeTokenAddress]
      ? communitiesByTokenAddress[entity.community.homeTokenAddress]
      : undefined
  }))
}

/**
 * @api {get} /entities/account/:account Fetch communities user own & part of
 * @apiName GetCommunitiesIOwn&PartOf
 * @apiGroup Entity
 *
 * @apiParam {String} account address
 *
 * @apiSuccess {Object[]} -   List of entities with their communities and tokens
 */
router.get('/account/:account', async (req, res, next) => {
  const { account } = req.params

  const results = await Entity.find({ account }).sort({ blockNumber: -1 })

  const data = await withCommunities(results)

  const communitiesUserOwn = sortBy(data.filter(({ isAdmin }) => isAdmin), ['updatedAt']).reverse().slice(0, 2)
  const communitiesUserPartOf = sortBy(data.filter(({ isAdmin }) => !isAdmin), ['updatedAt']).reverse().slice(0, 2)
  return res.json({ data: await withTokens([...communitiesUserOwn, ...communitiesUserPartOf]) })
})

router.put('/:communityAddress/:account', async (req, res) => {
  const { account, communityAddress } = req.params
  const { name } = req.body.metadata
  const { hash } = await metadataUtils.createMetadata(req.body.metadata)

  const uri = `ipfs://${hash}`
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

  let [ results, itemCount ] = await Promise.all([
    Entity.find(queryFilter).sort({ name: 1 }).limit(req.query.limit).skip(req.skip).populate('profile'),
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
