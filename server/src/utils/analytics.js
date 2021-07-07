const Analytics = require('analytics-node')
const config = require('config')
const { get } = require('lodash')
const { toChecksumAddress } = require('web3-utils')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

const trackDepositSuccess = async ({ address }) => {
  try {
    const walletAddress = toChecksumAddress(address)
    const userWallet = await UserWallet.findOne({ walletAddress })
    console.log(`Called track deposit success walletAddress: ${walletAddress}`)
    if (get(userWallet, 'os')) {
      const { phoneNumber, os } = userWallet
      const analyticsClient = new Analytics(config.get(`segment.${os}`))
      console.log(`fUSD Purchase Success: ${walletAddress} ${phoneNumber} ${os}`)
      analyticsClient.track({ event: 'fUSD Purchase Success', userId: phoneNumber })
    } else {
      console.log(`Couldn't track deposit success for ${walletAddress}`)
    }
  } catch (error) {
    console.log(`Error while track deposit for ${address} ${error}`)
  }
}

module.exports = {
  trackDepositSuccess
}
