const router = require('express').Router()
const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')

/**
 * @api {get} /bridges/:homeTokenAddress Fetch bridge by home token address
 * @apiName GetBridge
 * @apiGroup Bridge
 *
 * @apiParam {String} homeTokenAddress Home (Fuse) token address
 *
 * @apiSuccess {String} homeTokenAddress
 * @apiSuccess {String} foreignTokenAddress
 * @apiSuccess {String} foreignBridgeAddress
 * @apiSuccess {String} homeBridgeAddress
 * @apiSuccess {Number} foreignBridgeBlockNumber
 * @apiSuccess {Number} homeBridgeBlockNumber
 */
router.get('/:homeTokenAddress', async (req, res, next) => {
  const { homeTokenAddress } = req.params
  const bridge = await Bridge.findOne({ homeTokenAddress }).lean()
  return res.json({ data: bridge })
})

module.exports = router
