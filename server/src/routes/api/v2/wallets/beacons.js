const router = require('express').Router()
const mongoose = require('mongoose')
const Beacon = mongoose.model('Beacon')
const { walletOwner } = require('./auth')
const auth = require('@routes/auth')
const { createBeacon, getBeacon } = require('@utils/beacon')

router.post('/:walletAddress', walletOwner, async (req, res) => {
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

router.get('/:major/:minor', auth.required, async (req, res) => {
  const { major, minor } = req.params
  const beacon = await getBeacon({ major, minor })
  return res.json({ data: beacon })
})

module.exports = router
