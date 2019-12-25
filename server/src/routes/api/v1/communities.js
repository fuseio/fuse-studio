const config = require('config')
const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')
const lodash = require('lodash')
const branch = require('@utils/branch')
const twilio = require('@utils/twilio')
const sendgridUtils = require('@utils/sendgrid')

const makePlugin = ({ plugin }) => {
  const { name } = plugin
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
 * @api {post} /communities
 * @apiName Invite a user to community
 * @apiGroup Community
 *
 * @apiParamExample {json} Request-Example:
 *   {
 *      "phoneNumber": {{usePhoneNumber}},
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
    sendgridUtils.sendUserInventionToCommunity({ email, url })
    res.send({ response: 'ok' })
  } else if (phoneNumber) {
    twilio.createMessage({ to: phoneNumber, body: `${config.get('twilio.inviteTxt')}\n${url}` })
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
