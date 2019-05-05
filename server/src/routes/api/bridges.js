const router = require('express').Router()
const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')
const Token = mongoose.model('Token')
const bridgeUtils = require('@utils/bridge')

router.get('/', async (req, res, next) => {
  const { homeTokenAddress } = req.query
  const bridge = await Bridge.findOne({ homeTokenAddress }).lean()
  return res.json({ data: bridge })
})

router.get('/:foreignTokenAddress', async (req, res, next) => {
  const { foreignTokenAddress } = req.params
  const bridge = await Bridge.findOne({ foreignTokenAddress }).lean()
  return res.json({ data: bridge })
})

router.post('/:foreignTokenAddress', async (req, res) => {
  const address = req.params.foreignTokenAddress
  const bridgeExists = await bridgeUtils.bridgeMappingExists(address)

  if (!bridgeExists) {
    const token = await Token.findOne({ address })
    const result = await bridgeUtils.deployBridge(token)
    return res.json({ data: result })
  } else {
    return res.status(400).json({ error: 'Bridge already exists' })
  }
})

module.exports = router
