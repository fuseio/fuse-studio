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
 * @apiSuccess {Boolean} isClosed
 * @apiSuccess {Object} plugins
 * @apiSuccess {String} communityAddress
 * @apiSuccess {String} homeTokenAddress
 * @apiSuccess {String} foreignTokenAddress
 * @apiSuccess {String} foreignBridgeAddress
 * @apiSuccess {String} homeBridgeAddress
 */

/**
 * @api {get} /communities/:communityAddress Fetch community by community address
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

router.get('/', async (req, res, next) => {
  const { homeTokenAddress } = req.query
  const community = await Community.findOne({ homeTokenAddress }).lean()
  return res.json({ data: community })
})

module.exports = router
