const router = require('express').Router()
const mongoose = require('mongoose')
const Beacon = mongoose.model('Beacon')
const auth = require('./auth')
const { createBeacon } = require('@utils/beacon'
)
router.post('/:walletAddress', auth.walletOwner, async (req, res) => {
  const { wallet } = req.user
  let beacon
  if (!wallet.beacon) {
    beacon = await createBeacon(wallet)
    wallet.beacon = beacon._id
    await wallet.save()
  } else {
    beacon = await Beacon.findById(wallet.beacon)
  }
  return res.json({ data: beacon })
})

module.exports = router
