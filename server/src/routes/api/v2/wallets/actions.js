const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const auth = require('@routes/auth')

router.get('/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  // TODO: add query by updatedAt
  const docs = await WalletAction.find({ walletAddress }).populate('job')

  res.send({ data: docs })
})

module.exports = router
