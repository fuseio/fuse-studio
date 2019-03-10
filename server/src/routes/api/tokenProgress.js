const router = require('express').Router()
const mongoose = require('mongoose')
const TokenProgress = mongoose.model('TokenProgress')

router.get('/:tokenAddress', async (req, res, next) => {
  const {tokenAddress} = req.params
  const tokenProgress = await TokenProgress.findOne({ tokenAddress })
  return res.json({ data: tokenProgress })
})

module.exports = router
