const paginate = require('express-paginate')
const router = require('express').Router()
const config = require('config')
const mongoose = require('mongoose')
const Entity = mongoose.model('Entity')
const Profile = mongoose.model('Profile')
const metadataUtils = require('@utils/metadata')
const ipfsUtils = require('@utils/metadata/ipfs')
const Community = mongoose.model('Community')
const Token = mongoose.model('Token')
const { sortBy, keyBy, get, has, last } = require('lodash')
const { toChecksumAddress } = require('web3-utils')
const UserAccount = mongoose.model('UserAccount')
const auth = require('@routes/auth')
const { ObjectId } = mongoose.Types

const withCommunities = async (entities) => {
  const communityAddresses = entities.map(token => token.communityAddress)
  const communities = await Community.find({ communityAddress: { $in: communityAddresses } })
  const communitiesByTokenAddress = keyBy(communities, 'communityAddress')

  return entities.map((entity) => ({
    entity: { ...entity.toObject() },
    isAdmin: entity.isAdmin,
    communityAddress: entity.communityAddress,
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
 * @api {get} /entities/account/:account Fetch my communities
 * @apiDescription Fetching communities I'm part of
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

  const communitiesUserOwn = sortBy(data.filter(({ isAdmin }) => isAdmin), ['updatedAt']).reverse()
  const communitiesUserPartOf = sortBy(data.filter(({ isAdmin }) => !isAdmin), ['updatedAt']).reverse()
  return res.json({ data: await withTokens([...communitiesUserOwn, ...communitiesUserPartOf]) })
})

router.put('/:communityAddress/:account', async (req, res) => {
  const { account, communityAddress } = req.params

  const { name } = req.body.metadata
  const apiBase = `${config.get('api.protocol')}://${req.headers.host}${req.baseUrl}`
  const metadata = await metadataUtils.createMetadata(req.body.metadata, apiBase)

  const uri = metadata.uri || `ipfs://${metadata.hash}`
  const entity = await Entity.findOneAndUpdate({ account: toChecksumAddress(account), communityAddress }, { uri, name }, { new: true, upsert: true })
  return res.json({ data: entity })
})

/**
 * @apiDefine EntityData
 * @apiDescription Entity is an account on the Fuse network. It can have variety of roles like user, admin, business, or custom defined role.
 * @apiSuccess {String} account Entity's account on Fuse network
 * @apiSuccess {String} communityAddress Community address of the entity
 * @apiSuccess {String} uri IPFS URI points to entity's metadata
 * @apiSuccess {String} name Entity's name
 * @apiSuccess {String} roles Entity's role encoded as a byte array
 * @apiSuccess {String} type Entity's type
 * @apiSuccess {Boolean} isAdmin
 * @apiSuccess {Boolean} isApproved
 */

/**
 * @api {get} /entities/:communityAddress/:account Fetch entity
 * @apiName GetEntity
 * @apiGroup Entity
 *
 * @apiParam {String} communityAddress Community address
 * @apiParam {String} account Entity's account address
 *
 * @apiUse EntityData
 */
router.get('/:communityAddress/:account', async (req, res, next) => {
  const { account, communityAddress } = req.params
  const entity = await Entity.findOne({ account, communityAddress })

  return res.json({ data: entity })
})

/**
 * @api {get} /entities/metadata/:communityAddress/:account Fetch entity metadata
 * @apiName GetEntityMetadata
 * @apiGroup Entity
 *
 * @apiParam {String} communityAddress Community address
 * @apiParam {String} account Entity's account address
 *
 * @apiUse EntityData
 */
router.get('/metadata/:communityAddress/:account', async (req, res, next) => {
  const { account, communityAddress } = req.params
  const entity = await Entity.findOne({ account: toChecksumAddress(account), communityAddress: toChecksumAddress(communityAddress) })
  const uri = get(entity, 'uri', false)
  if (uri) {
    let metadata
    if (ipfsUtils.isIpfsHash(uri)) {
      metadata = await ipfsUtils.getMetadata(last(uri.split('://')))
    } else {
      metadata = await metadataUtils.getMetadata(last(uri.split('/')))
    }
    if (has(metadata, 'data.account')) {
      try {
        metadata.data.account = toChecksumAddress(metadata.data.account)
      } catch (e) {
        console.error(e)
      }
    }
    return res.json({ ...metadata })
  }
  return res.json({ data: entity })
})

const getQueryFilter = ({ query: { type }, params: { communityAddress } }) =>
  type ? { type, communityAddress: toChecksumAddress(communityAddress) } : { communityAddress: toChecksumAddress(communityAddress) }

const getQuerySearch = ({ query: { search } }) => ({ search })

/**
 * @api {get} /entities/:communityAddress Fetch community entities
 * @apiName GetEntities
 * @apiGroup Entity
 *
 * @apiParam {String} communityAddress Community address of the Fuse network
 * @apiParam {Number} page Page number for pagination
 * @apiParam {Boolean} withMetadata Get entities with entity's metadata
 * @apiParam {String} search Entity's name for a search by name
 *
 * @apiSuccess {Object[]} -   List of entities. See GetEntity endpoint for entity fields
 */
router.get('/:communityAddress', async (req, res, next) => {
  const queryFilter = getQueryFilter(req)
  const { withMetadata } = req.query
  const querySearch = getQuerySearch(req)

  let profiles

  if (querySearch && querySearch.search) {
    const [searchMatches] = await Promise.all([
      Profile.find({
        $or: [
          { 'publicData.firstName': { $regex: `.*${querySearch.search}.*`, $options: 'i' } },
          { 'publicData.lastName': { $regex: `.*${querySearch.search}.*`, $options: 'i' } },
          { 'publicData.name': { $regex: `.*${querySearch.search}.*`, $options: 'i' } }
        ]
      }).sort({ name: 1 })
    ])

    profiles = searchMatches.map(({ _id }) => _id)
  }

  const queries = profiles ? {
    ...queryFilter, profile: { $in: profiles }
  } : queryFilter

  let [results, itemCount] = await Promise.all([
    Entity.find(queries).sort({ name: 1 }).limit(req.query.limit).skip(req.skip).populate('profile'),
    Entity.countDocuments(queryFilter)
  ])

  if (withMetadata) {
    const metadatas = await Promise.all(results.map(({ uri }) => uri
      ? ipfsUtils.isIpfsHash(uri)
        ? ipfsUtils.getMetadata(last(uri.split('://')))
        : metadataUtils.getMetadata(last(uri.split('/')))
      : null))
    results = results.map((result, index) => ({ ...result.toObject(), metadata: (metadatas[index] && metadatas[index].data) || {} }))
  }

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results,
    pageCount
  })
})

/**
 * @apiDefine Onwership Data
 * @apiDescription Resolves whether FuseStudioUser Accounts is admin on different wallet address 
 * @apiSuccess {String} account Community account address of owner
 * @apiSuccess {Boolean} isAdmin 
 */

/**
 * @api {get} /entities/owner/:communityAddress/:account Fetch entity
 * @apiName GetEntity
 * @apiGroup Entity
 *
 * @apiParam {String} communityAddress Community address
 * @apiParam {String} emails user's registered email
 *
 * @apiUse EntityData
 */ 
 router.post('/owner/:communityAddress/:account', auth.required,  async (req, res, next) => {
  const { account, communityAddress } = req.params
  const { id } = req.user
  const userAccounts =  await UserAccount.find({ studioUser: ObjectId(id) })
  const result = {isAdmin: false, isOwner: false, creatorAddress: undefined}
    userAccounts.forEach(async (user) => {
      const entities = await Entity.find(ObjectId(user.accountAddress)).sort({ blockNumber: -1 })
      const data = await withCommunities(entities)
      const communitiesUserOwn = sortBy(data.filter(({ isAdmin }) => isAdmin), ['updatedAt']).reverse()
        communitiesUserOwn.forEach((communityOwned) =>{
          if (communityOwned.communityAddress === communityAddress){
            result.isOwner = true 
            result.creatorAddress = communitiesUserOwn.creatorAddress
            if(communityOwned.creatorAddress === account  ){
              result.isAdmin = true; 
            }
          return result
        }
      })
  });

  /* if user is on valid account return isAdmin: true, isOwner: true, accountAddress: account
  if user has valid account return isAdmin: false, isOwner: true, accountAddress: accountAddress
  if user is not owner return isAdmin: false, isOwner: false, accountAddress: undefined */
  return res.json({response: result, list: entities, owned: communitiesUserOwn})
})

module.exports = router
