const router = require('express').Router()
const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')

/**
 * @api {get} /bridges/:homeTokenAddress Fetch bridge
 * @apiName GetBridge
 * @apiGroup Bridge
 * @apiDescription The token bridge connects the Ethereum and Fuse network
 *
 * @apiParam {String} homeTokenAddress Home (Fuse) token address
 *
 * @apiSuccess {String} homeTokenAddress Token address on the Fuse network
 * @apiSuccess {String} foreignTokenAddress Token address on the Ethereum network
 * @apiSuccess {String} foreignBridgeAddress Bridge address on the Ethereum network
 * @apiSuccess {String} homeBridgeAddress Bridge address on the Fuse network
 * @apiSuccess {Number} homeBridgeBlockNumber Bridge creation block number on the Fuse network
 * @apiSuccess {Number} foreignBridgeBlockNumber Bridge creation block number on the Ethereum network
 */
router.get('/:homeTokenAddress', async (req, res, next) => {
  const { homeTokenAddress } = req.params
  const bridge = await Bridge.findOne({ homeTokenAddress }).lean()
  return res.json({ data: bridge })
})

module.exports = router
