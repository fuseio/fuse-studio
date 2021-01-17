
const router = require('express').Router()
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const UserWallet = mongoose.model('UserWallet')
const auth = require('@routes/auth')

router.get('/:depositId', auth.required, async (req, res) => {
  const deposit = await Deposit.findById(req.params.depositId)
  const { accountAddress } = req.user
  const { customerAddress } = deposit
  if (await UserWallet.findOne({ accountAddress, walletAddress: customerAddress })) {
    res.json({ data: deposit })
  } else {
    res.status(403).send({ error: 'Lacking access for object' })
  }
})

module.exports = router
