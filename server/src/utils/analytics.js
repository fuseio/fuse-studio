const Analytics = require('analytics-node')
const config = require('config')
const { get } = require('lodash')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

const trackDepositSuccess = async ({ walletAddress }) => {
  const userWallet = await UserWallet.findOne({ walletAddress })
  if (get(userWallet, 'os')) {
    const { phoneNumber, os } = userWallet
    const analyticsClient = new Analytics(config.get(`segment.${os}`))
    analyticsClient.track({ event: 'fUSD Purchase Success', userId: phoneNumber })
  }
}

module.exports = {
  trackDepositSuccess
}
