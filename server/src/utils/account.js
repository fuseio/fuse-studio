const mongoose = require('mongoose')
const Account = mongoose.model('Account')
var { fromMasterSeed } = require('ethereumjs-wallet/hdkey')

const lockAccount = async (query = { role: '*' }) => {
  return Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date() })
}

const unlockAccount = async (address) =>
  Account.findOneAndUpdate({ address }, { isLocked: false, lockingTime: null })

const withAccount = (func, getAccount) => async (...params) => {
  const account = getAccount ? await getAccount(...params) : await lockAccount()
  if (!account) {
    throw new Error('no unlocked accounts available')
  }
  try {
    await func(account, ...params)
    await unlockAccount(account.address)
  } catch (e) {
    await unlockAccount(account.address)
    throw e
  }
}
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
  withAccount,
  generateAccounts
}
