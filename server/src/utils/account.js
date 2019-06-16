const mongoose = require('mongoose')
const Account = mongoose.model('Account')

const lockAccount = async () => {
  return Account.findOneAndUpdate({ isLocked: false }, { isLocked: true, lockingTime: new Date() })
}

const unlockAccount = async (address) =>
  Account.findOneAndUpdate({ address }, { isLocked: false, lockingTime: null })

module.exports = {
  lockAccount,
  unlockAccount
}
