const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const { isEqual } = require('lodash')

const verifyWalletOwner = async ({ phoneNumber, accountAddress }) => {
  const wallet = await UserWallet.findOne({ accountAddress })
  if (!wallet) {
    return true
  } else if (isEqual(phoneNumber, wallet.phoneNumber)) {
    return true
  } else {
    return false
  }
}

module.exports = {
  verifyWalletOwner
}
