const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const jwt = require('jsonwebtoken')
var { fromMasterSeed } = require('ethereumjs-wallet/hdkey')

const lockAccount = async (query = { role: '*' }) => {
  return Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date() })
}

const lockAccountWithReason = async (query = { role: '*' }, reason) => {
  return Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date(), lockingReason: reason })
}

const unlockAccount = async (address) =>
  Account.findOneAndUpdate({ address }, { isLocked: false, lockingTime: null, lockingReason: null })

const withAccount = (func, filterOrLockingFunction) => async (...params) => {
  let account
  if (typeof queryOrLockingFunction === 'function') {
    account = await filterOrLockingFunction(...params)
  } else {
    account = await lockAccount(filterOrLockingFunction)
  }

  if (!account) {
    throw new Error('no unlocked accounts available')
  }
  try {
    console.log(`account ${account.address} is locked for running a task`)
    await func(account, ...params)
    console.log(`unlocking the account ${account.address}`)
    await unlockAccount(account.address)
  } catch (e) {
    await unlockAccount(account.address)
    throw e
  }
}

const withWalletAccount = (func) => withAccount(func, ({ network }) => {
  const bridgeType = network === config.get('network.foreign.name') ? 'foreign' : 'home'
  return lockAccount({ role: 'wallet', bridgeType })
})

const generateAccounts = (seed, accountsNumber) => {
  const wallet = fromMasterSeed(seed)
  for (let i = 0; i < accountsNumber; i++) {
    const derivedWallet = wallet.deriveChild(i).getWallet()
    const derivedAddress = derivedWallet.getChecksumAddressString()
    console.log(derivedAddress)
  }
}

const generateAccountAddress = (childIndex = 0) => {
  const mnemonic = config.get('secrets.accounts.seed')
  const address = fromMasterSeed(mnemonic).deriveChild(childIndex).getWallet().getAddressString()
  return address
}

const createAccount = async (role = '*') => {
  const lastAccount = await Account.findOne().sort({ childIndex: -1 })
  const lastChildIndex = (lastAccount && lastAccount.childIndex) || 0
  const childIndex = lastChildIndex + 1
  const address = generateAccountAddress(childIndex)
  const account = await new Account({
    childIndex,
    address,
    role
  }).save()
  console.log(`new admin account created, address: ${account.address}, jwt: ${generateAdminJwt(account.address)}`)
  return account
}

const generateAdminJwt = (accountAddress) => {
  const secret = config.get('api.secret')
  return jwt.sign({
    accountAddress,
    isCommunityAdmin: true
  }, secret)
}

module.exports = {
  lockAccount,
  lockAccountWithReason,
  unlockAccount,
  withAccount,
  withWalletAccount,
  createAccount,
  generateAccounts,
  generateAdminJwt
}
