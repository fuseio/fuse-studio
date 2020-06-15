const router = require('express').Router()
const mongoose = require('mongoose')
const WalletTransaction = mongoose.model('WalletTransaction')
const { pickBy, identity } = require('lodash')
const auth = require('@routes/auth')

const clean = (obj) => pickBy(obj, identity)

router.get('/', auth.required, async (req, res) => {
  const { tokenAddress } = req.query
  const { docs, hasNextPage } = await WalletTransaction.paginate(clean({ tokenAddress }))

  res.send({ data: docs, hasNextPage })
})

router.get('/:walletAddress', auth.required, async (req, res) => {
  const { tokenAddress } = req.query
  const { walletAddress } = req.params
  const { docs, hasNextPage } = await WalletTransaction.paginate(clean({ tokenAddress, $or: [ { to: walletAddress }, { from: walletAddress } ] }))

  res.send({ data: docs, hasNextPage })
})

module.exports = router
