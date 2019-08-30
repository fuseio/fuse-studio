const mongoose = require('mongoose')
const Account = mongoose.model('Account')
var { fromMasterSeed } = require('ethereumjs-wallet/hdkey')

const lockAccount = async () => {
  return Account.findOneAndUpdate({ isLocked: false }, { isLocked: true, lockingTime: new Date() })
}

const unlockAccount = async (address) =>
  Account.findOneAndUpdate({ address }, { isLocked: false, lockingTime: null })

const generateAccounts = (seed, accountsNumber) => {
  const wallet = fromMasterSeed(seed)
  for (let i = 0; i < accountsNumber; i++) {
    const derivedWallet = wallet.deriveChild(i).getWallet()
    const derivedAddress = derivedWallet.getChecksumAddressString()
    console.log(derivedAddress)
  }
}

module.exports = {
  lockAccount,
  unlockAccount,
  generateAccounts
}
