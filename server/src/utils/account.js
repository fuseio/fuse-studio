const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
var { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const wallet = fromMasterSeed(config.get('secrets.accounts.seed'))

const lockAccount = async (query = { role: '*' }) => {
  return Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date() })
}

const unlockAccount = async (address) => {
  Account.findOneAndUpdate({ address }, { isLocked: false, lockingTime: null })
}

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

const createAccountWithRole = async (role) => {
  const { childIndex } = await Account.findOne({}, { childIndex: 1 }).sort({ childIndex: -1 })
  const newAccountChildIndex = childIndex + 1
  const newAccountAddress = wallet.deriveChild(newAccountChildIndex).getWallet().getAddressString()
  const account = await new Account({
    address: newAccountAddress,
    childIndex: newAccountChildIndex,
    nonces: { home: 0, foreign: 0 },
    role
  }).save()
  return { accountId: account._id, accountAddress: account.address }
}

module.exports = {
  lockAccount,
  unlockAccount,
  withAccount,
  createAccountWithRole
}
