const router = require('express').Router()
const mongoose = require('mongoose')
const Beacon = mongoose.model('Beacon')
const auth = require('./auth')
const taskManager = require('@services/taskManager')

router.post('/:walletAddress', auth.walletOwner, async (req, res) => {
  const { wallet } = req.user
  debugger
  // const beacon = await Beacon.find({ paddedVersion: { $gt: wallet.paddedVersion } }).sort({ paddedVersion: 1 })

  // const { upgradeId, relayParams } = req.body
  // if (wallet.upgradesInstalled.includes(upgradeId)) {
  //   return res.status(400).send({ error: `Upgrade ${upgradeId} already installed for wallet ${wallet.walletAddress}` })
  // }
  // const upgrade = await WalletUpgrade.findById(upgradeId)
  // if (!upgrade) {
  //   return res.status(400).send({ error: `Upgrade ${upgradeId} could not be found` })
  // }

  // if (upgrade.paddedVersion <= wallet.paddedVersion) {
  //   return res.status(400).send({ error: `Wallet version is ${wallet.version} is higher than the version ${upgrade.version} proposed by upgrade ${upgradeId}` })
  // }

  const job = await taskManager.now('stakeBonus', { receiverAddress: '0x97fb821aa7B2393fFFAc6cd9dF267c505f240B45', tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' })
  return res.json({ data: job })
})

module.exports = router
