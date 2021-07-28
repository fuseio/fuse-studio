const router = require('express').Router()
const auth = require('./auth')
const mongoose = require('mongoose')
const WalletUpgrade = mongoose.model('WalletUpgrade')
const taskManager = require('@services/taskManager')

router.get('/available/:walletAddress', auth.walletOwner, async (req, res) => {

  const { wallet } = req.user

  const upgrades = await WalletUpgrade.find().sort({ order: 1 })
  const availableUpgrades = upgrades.filter(upgrade => !wallet.upgradesInstalled.includes(upgrade.id))

  return res.json({ data: availableUpgrades })
})

router.post('/install/:walletAddress', auth.walletOwner, async (req, res) => {
  const { wallet, appName, identifier } = req.user
  const { upgradeId, relayParams } = req.body
  if (wallet.upgradesInstalled.includes(upgradeId)) {
    return res.status(400).send({ error: `Upgrade ${upgradeId} already installed for wallet ${wallet.walletAddress}` })
  }
  const upgrade = await WalletUpgrade.findById(upgradeId)
  if (!upgrade) {
    return res.status(400).send({ error: `Upgrade ${upgradeId} could not be found` })
  }

  const job = await taskManager.now('installUpgrade', { ...relayParams, identifier, appName, upgradeId })
  return res.json({ data: job })
})

module.exports = router
