const router = require('express').Router()
const moment = require('moment')
const config = require('config')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const RewardClaim = mongoose.model('RewardClaim')
const { agenda } = require('@services/agenda')
const taskManager = require('@services/taskManager')
const UserWallet = require('@models/UserWallet')

router.get('/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { accountAddress } = req.user
  const wallet = await UserWallet.findOne({ walletAddress })

  if (wallet.accountAddress.toLowerCase() !== accountAddress.toLowerCase()) {
    return res.status(403).json({ error: `account address ${accountAddress} does not own the wallet ${walletAddress}` })
  }

  const job = await taskManager.now('claimApy', { walletAddress, tokenAddress, reward, transactionBody: { value: reward.amount } }, { isWalletJob: true })
  return res.json({ data: job })
})

module.exports = router
