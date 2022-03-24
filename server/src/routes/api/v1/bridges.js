const router = require('express').Router()
const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')

router.get('/:homeTokenAddress', async (req, res, next) => {
  const { homeTokenAddress } = req.params
  const bridge = await Bridge.findOne({ homeTokenAddress }).lean()
  return res.json({ data: bridge })
})

module.exports = router
