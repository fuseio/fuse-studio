const router = require('express').Router()
const mongoose = require('mongoose')
const BusinessList = mongoose.model('BusinessList')

router.get('/', async (req, res, next) => {
  const { tokenAddress } = req.query
  const businessList = await BusinessList.findOne({ tokenAddress }).lean()
  return res.json({ data: businessList })
})

router.get('/:listAddress', async (req, res, next) => {
  const { listAddress } = req.params
  const businessList = await BusinessList.findOne({ listAddress }).lean()
  return res.json({ data: businessList })
})

module.exports = router
