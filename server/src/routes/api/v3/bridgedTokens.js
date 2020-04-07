const router = require('express').Router()
const mongoose = require('mongoose')
const BridgedToken = mongoose.model('BridgedToken')

// TODO authentication ?!?!

router.post('/', async (req, res, next) => {
  const bridgedToken = await new BridgedToken(req.body).save()
  res.send({ data: bridgedToken })
})

router.get('/', async (req, res, next) => {
  const bridgedTokens = await BridgedToken.find()
  if (!bridgedTokens || bridgedTokens.length === 0) {
    return res.status(404).json({ error: 'Bridged tokens not found' })
  }
  res.send({ data: bridgedTokens })
})

module.exports = router
