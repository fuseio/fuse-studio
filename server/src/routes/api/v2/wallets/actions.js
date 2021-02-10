
const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const auth = require('@routes/auth')

router.get('/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { updatedAt } = req.query
  // TODO: add query by updatedAt
  const result = await WalletAction.paginate({
    walletAddress,
    ...(updatedAt && { updatedAt: { $gte: updatedAt } })
    }, { populate: 'job'} )

  res.send({ data: result })
})

module.exports = router
