const Analytics = require('analytics-node')
const config = require('config')
const { get } = require('lodash')
const { toChecksumAddress } = require('web3-utils')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

const trackDepositStatus = async ({ address, status }) => {
  try {
    const walletAddress = toChecksumAddress(address)
    const userWallet = await UserWallet.findOne({ walletAddress })
    console.log(`Called track deposit ${status} walletAddress: ${walletAddress}`)
    if (get(userWallet, 'os')) {
      const { phoneNumber, os } = userWallet
      const analyticsClient = new Analytics(config.get(`segment.${os}`))
      console.log(`fUSD Purchase ${status}: ${walletAddress} ${phoneNumber} ${os}`)
      analyticsClient.track({ event: `fUSD Purchase ${status}`, userId: phoneNumber })
    } else {
      console.log(`Couldn't track deposit  ${status} for ${walletAddress}`)
    }
  } catch (error) {
    console.log(`Error while track deposit for ${address} ${error}`)
  }
}

module.exports = {
  trackDepositStatus
}
