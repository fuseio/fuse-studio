const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')

/**
 * @apiDefine Add Plugins
 * @apiSuccess {Boolean} isClosed
 * @apiSuccess {Object} plugins
 * @apiSuccess {String} communityAddress
 * @apiSuccess {String} homeTokenAddress
 * @apiSuccess {String} foreignTokenAddress
 * @apiSuccess {String} foreignBridgeAddress
 * @apiSuccess {String} homeBridgeAddress
 */

/**
 * @api {post} /communities/:communityAddress Add plugins to community
 * @apiName AddPlugins
 * @apiGroup Community
 * @apiParam {String} communityAddress Community address
 * @apiParam {Object} plugins The plugins (with arguments)
 * @apiParamExample {json} Request-Example:
 *     {
 *       "plugins": {
 *          "businessList": {
 *              "isActive": true,
 *           },
 *          "joinBonus": {
 *              "isActive": false,
 *              "hasTransferToFunder": false
 *          },
 *       }
 *     }
 *
 */
router.post('/:communityAddress', async (req, res, next) => {
  const { communityAddress } = req.params
  const { plugins } = req.body
  const { plugins: oldPlugins } = await Community.findOne({ communityAddress })
  const newPlugins = Object.keys(plugins).reduce((newPlugins, pluginName) => ({
    ...oldPlugins,
    ...newPlugins,
    [pluginName]: oldPlugins && oldPlugins[pluginName] ? {
      ...oldPlugins[pluginName],
      ...plugins[pluginName]
    } : {
      ...plugins[pluginName]
    }
  }), {})
  const community = await Community.findOneAndUpdate({ communityAddress }, { plugins: { ...newPlugins } }, { new: true })
  return res.json({ data: community })
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
  const community = await Community.findOne({ communityAddress }).lean()
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

module.exports = router
