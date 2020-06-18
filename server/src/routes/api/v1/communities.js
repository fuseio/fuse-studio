const config = require('config')
const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const Entity = mongoose.model('Entity')
const Token = mongoose.model('Token')
const lodash = require('lodash')
const branch = require('@utils/branch')
const smsProvider = require('@utils/smsProvider')
const { sign } = require('@utils/crypto')
const sendgridUtils = require('@utils/sendgrid')
const { toChecksumAddress } = require('web3-utils')
const { getWeb3 } = require('@services/web3')
const { fetchTokenData } = require('@utils/token')

const makePlugin = ({ plugin }) => {
  const { name } = plugin

  // Onramp is a nested plugin
  if (name === 'onramp') {
    const services = lodash.fromPairs(
      lodash.toPairs(lodash.get(plugin, 'services', {})).map(([key, value]) => [key, config.has(`plugins.${value.name}.args`) ? { ...config.get(`plugins.${value.name}.args`), ...value } : value])
    )
    return {
      ...plugin,
      services
    }
  }

  if (config.has(`plugins.${name}.args`)) {
    return { name, ...config.get(`plugins.${name}.args`), ...plugin }
  } else {
    return { name, ...plugin }
  }
}

/**
 * @api {post} /communities/:communityAddress/plugins Add plugins to community
 * @apiName AddPlugins
 * @apiGroup Community
 * @apiParam {String} communityAddress Community address
 * @apiParam {Object} plugins The plugins (with arguments)
 * @apiParamExample {json} Request-Example:
 *   {
 *      "name": "joinBonus",
 *      "isActive": false
 *    }
 */

router.post('/:communityAddress/plugins', async (req, res, next) => {
  const { communityAddress } = req.params
  const plugin = makePlugin(req.body)
  const fields = lodash.fromPairs(lodash.toPairs(plugin).map(([key, value]) => [`plugins.${plugin.name}.${key}`, value]))
  const community = await Community.findOneAndUpdate({ communityAddress }, fields, { new: true })

  return res.json({ data: community })
})

/**
 * @api {put} /communities/:communityAddress Update community metadata
 * @apiName UpdateCommunity
 * @apiGroup Community
 * @apiParam {String} communityAddress Community address
 * @apiParam {Object} community metadata to update
 * @apiParamExample {json} Request-Example:
 *   {
 *      "communityURI": "ipfs://hash",
 *    }
 */

router.put('/:communityAddress', async (req, res) => {
  const { communityAddress } = req.params
  const { communityURI, description, webUrl } = req.body
  const community = await Community.findOneAndUpdate({ communityAddress }, lodash.pickBy({ communityURI, description, webUrl }, lodash.identity), { new: true })
  return res.json({ data: community })
})

/**
 * @api {put} /communities/:communityAddress/secondary Set secondary token for the community
 * @apiName SetSecondaryToken
 * @apiGroup Community
 * @apiParam {String} secondaryTokenAddress Address of the secondary token
 * @apiParam {String} networkType Token's network type
 * @apiParam {String} tokenType Token's network type
 * @apiParamExample {json} Request-Example:
 *   {
 *      "secondaryTokenAddress": "0xd6aab51d1343dcbee9b47e6fef8ba4469cf3dbde",
 *      "networkType": "fuse",
 *      "tokenType": "basic"
 *    }
 */

router.put('/:communityAddress/secondary', async (req, res) => {
  const { communityAddress } = req.params
  const { networkType, tokenType, secondaryTokenAddress } = req.body
  const token = await Token.findOne({ address: secondaryTokenAddress })
  if (!token) {
    const web3 = getWeb3({ networkType })
    const tokenData = await fetchTokenData(secondaryTokenAddress, {}, web3)
    await new Token({ address: secondaryTokenAddress, networkType, tokenType, ...tokenData }).save()
  }
  const community = await Community.findOneAndUpdate({ communityAddress }, { secondaryTokenAddress }, { new: true })
  return res.json({ data: community })
})

/**
 * @api {post} /communities/:communityAddress/invite Invite a user to community
 * @apiName InviteUser
 * @apiGroup Community
 * @apiParam {String} communityAddress Community address
 * @apiParamExample {json} Request-Example:
 *   {
 *      "phoneNumber": {{userPhoneNumber}},
 *   }
 *
 * @apiParamExample {json} Request-Example:
 *   {
 *      "email": {{userEmail}},
 *   }
 *
 */

router.post('/:communityAddress/invite', async (req, res, next) => {
  const { communityAddress } = req.params
  const { phoneNumber, email } = req.body
  const { url } = await branch.createDeepLink({ communityAddress })
  if (email) {
    sendgridUtils.sendUserInvitationToCommunity({ email, url })
    res.send({ response: 'ok' })
  } else if (phoneNumber) {
    smsProvider.createMessage({ to: phoneNumber, body: `${config.get('inviteTxt')}\n${url}` })
    res.send({ response: 'ok' })
  }
})

/**
 * @apiDefine CommunityData
 * @apiDescription Community is a set of contracts and services. Members of the community are users of the Fuse network. The community is configured via the plugins.
 * @apiSuccess {String} communityAddress Address of the community on the Fuse network
 * @apiSuccess {String} homeTokenAddress Address of the community token on the Fuse network
 * @apiSuccess {String} foreignTokenAddress Address of the community token on the Ethereum network
 * @apiSuccess {String} homeBridgeAddress Address of the community bridge on the Fuse network
 * @apiSuccess {String} foreignBridgeAddress Address of the community bridge on the Ethereum network
 * @apiSuccess {Boolean} isClosed Is the community is closed or open. Closed community requires an approve of community admin to join.
 * @apiSuccess {Object} plugins Defines the community plugins.
 */

/**
 * @api {get} /communities/:communityAddress Fetch community
 * @apiName GetFeaturedCommunities
 * @apiGroup Community
 *
 *
 * @apiUse CommunityData
 */

router.get('/featured', async (req, res, next) => {
  const community = await Community.find({ featured: true }).lean()
  return res.json({ data: community })
})

/**
 * @api {get} /communities/:communityAddress Fetch community
 * @apiName GetCommunity
 * @apiGroup Community
 *
 * @apiParam {String} communityAddress Community address
 *
 * @apiUse CommunityData
 */
router.get('/:communityAddress', async (req, res, next) => {
  const { communityAddress } = req.params
  const community = await Community.findOne({ communityAddress: toChecksumAddress(communityAddress) }).lean()
  return res.json({ data: community })
})

/**
 * @api {get} /communities
 * @apiName GetCommunities
 * @apiGroup Community
 *
 * @apiParam {String} homeTokenAddress Home token address (optional)
 *
 * @apiUse CommunityData
 */
router.get('/', async (req, res, next) => {
  const { homeTokenAddress } = req.query
  const community = await Community.findOne({ homeTokenAddress }).lean()
  return res.json({ data: community })
})

const withTokens = async (communities) => {
  const homeTokenAddresses = communities.map(community => community.homeTokenAddress)

  const tokens = await Token.find({ address: { $in: homeTokenAddresses } })

  const communitiesByTokenAddress = lodash.keyBy(tokens, 'address')

  return communities.map((community) => ({
    ...community,
    token: communitiesByTokenAddress[community.homeTokenAddress]
      ? communitiesByTokenAddress[community.homeTokenAddress]
      : undefined
  }))
}

const getCommunitiesByEntities = (entities) => {
  const communityAddresses = entities.map(entity => entity.communityAddress)
  return Community.find({ communityAddress: { $in: communityAddresses } }).sort({ createdAt: -1 })
}
/**
 * @api {get} /communities/account/:account Fetch my communities
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

  const adminEntities = await Entity.find({ account, isAdmin: true }).sort({ blockNumber: -1 })
  const adminCommunitities = (await getCommunitiesByEntities(adminEntities)).map(community => ({ ...community.toObject(), isAdmin: true }))

  const nonAdminEntities = await Entity.find({ account, isAdmin: false }).sort({ blockNumber: -1 })

  const monAdminCommunitites = await getCommunitiesByEntities(nonAdminEntities)
  return res.json({ data: await withTokens([...adminCommunitities, ...monAdminCommunitites]) })
})

/**
 * @api {get} /communities/:communityAddress Fetch community with plugins adjusted for the specified account
 * @apiName GetCommunity
 * @apiGroup Community
 *
 * @apiParam {String} communityAddress Community address
 * @apiParam {String} accountAddress User account address
 *
 * @apiUse CommunityData
 */
router.get('/:communityAddress/:accountAddress', async (req, res) => {
  const { communityAddress, accountAddress } = req.params
  const community = await Community.findOne({ communityAddress: toChecksumAddress(communityAddress) }).lean()
  if (lodash.has(community, 'plugins.onramp.services.moonpay.widgetUrl') && config.has('plugins.moonpay.api.secret')) {
    const newWidgetUrl = `${community.plugins.onramp.services.moonpay.widgetUrl}&externalCustomerId=${accountAddress}_${toChecksumAddress(communityAddress)}`
    const signature = sign(new URL(newWidgetUrl).search, config.get('plugins.moonpay.api.secret'))
    community.plugins.onramp.services.moonpay.widgetUrl = `${newWidgetUrl}&signature=${encodeURIComponent(signature)}`
  }
  if (lodash.has(community, 'plugins.onramp.services.transak.widgetUrl') && config.has('plugins.transak.api.secret')) {
    community.plugins.onramp.services.transak.widgetUrl = `${community.plugins.onramp.services.transak.widgetUrl}&partnerCustomerId=${accountAddress}_${toChecksumAddress(communityAddress)}`
  }
  if (lodash.has(community, 'plugins.onramp.services.rampInstant.widgetUrl')) {
    community.plugins.onramp.services.rampInstant.widgetUrl = `${community.plugins.onramp.services.transak.widgetUrl}&userAddress=${accountAddress}_${toChecksumAddress(communityAddress)}`
  }
  return res.json({ data: community })
})

module.exports = router
