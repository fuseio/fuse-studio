
const router = require('express').Router()
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const UserWallet = mongoose.model('UserWallet')
const auth = require('@routes/auth')

router.get('/:customerAddress', auth.required, async (req, res) => {
  const { accountAddress } = req.user
  const { customerAddress } = req.params
  if (await UserWallet.findOne({ accountAddress, walletAddress: customerAddress })) {
    const deposits = await Deposit.find({ customerAddress }).sort({ createdAt: -1 })
    res.json({ data: deposits })
  } else {
    res.status(403).send({ error: 'Lacking access for the customer wallet' })
  }
})

module.exports = router
