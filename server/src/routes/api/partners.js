const router = require('express').Router()
const mongoose = require('mongoose')
const Partner = mongoose.model('Partner')

router.get('/', async (req, res, next) => {
  const partners = await Partner.find({})

  res.json({
    object: 'list',
    data: partners
  })
})

module.exports = router
