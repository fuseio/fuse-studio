const router = require('express').Router()
const mongoose = require('mongoose')
const Community = mongoose.model('Community')

/**
 * @apiDefine CommunityData
 * @apiSuccess {Boolean} isClosed
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

module.exports = router
