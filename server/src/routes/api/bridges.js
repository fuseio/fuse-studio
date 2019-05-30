const router = require('express').Router()
const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')

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

module.exports = router
