const router = require('express').Router()
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const auth = require('@routes/auth')

router.get('/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { updatedAt, tokenAddress } = req.query
  const result = await WalletAction.paginate(
    {
      walletAddress,
      ...(updatedAt && { updatedAt: { $gte: updatedAt } }),
      ...(tokenAddress && { tokenAddress })
    }
  )
  res.send({ data: result })
})

module.exports = router
