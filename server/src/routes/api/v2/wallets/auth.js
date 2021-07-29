const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const auth = require('@routes/auth')

const walletOwner = async (req, res, next) => {
  const { walletAddress } = req.params
  console.log(req.params)
  const { accountAddress } = req.user
  if (!walletAddress) {
    return res.status(400).send({ error: 'Wallet address is not provided' })
  }

  const wallet = await UserWallet.findOne({ walletAddress })
  if (!wallet) {
    return res.status(400).send({ error: `Wallet ${walletAddress} could not be found` })
  }

  if (wallet.accountAddress !== accountAddress) {
    return res.status(403).send({ error: `Wallet ${walletAddress} is not owner by ${accountAddress}` })
  }
  req.user.wallet = wallet
  next()
}

module.exports = {
  walletOwner: [auth.required, walletOwner]
}
