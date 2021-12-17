const config = require('config')
const { toChecksumAddress } = require('web3-utils')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const jwt = require('jsonwebtoken')
var { fromMasterSeed } = require('ethereumjs-wallet/hdkey')

const lockAccount = async (query = { role: '*' }) => {
  const account = await Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date() })
  if (account) {
    console.log(`account ${account.address} with id ${account._id} is locked by query ${JSON.stringify(query)}`)
    return account
  }
  console.log(`no free account found by query ${JSON.stringify(query)}`)
}

const getAccount = async (query = { role: '*' }) => {
  const account = await Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date() })
  if (account) {
    console.log(`account ${account.address} with id ${account._id} is locked by query ${JSON.stringify(query)}`)
    return account
  }
  console.log(`no free account found by query ${JSON.stringify(query)}`)
}

const lockAccountWithReason = async (query = { role: '*' }, reason) => {
  const account = await Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date(), lockingReason: reason })
  if (account) {
    console.log(`account ${account.address} with id ${account._id} is locked by query ${JSON.stringify(query)}, locking reason: ${reason}`)
    return account
  }
  console.log(`no free account found by query ${JSON.stringify(query)}, locking reason: ${reason}`)
}

const unlockAccount = async (accountId) => {
  const account = await Account.findByIdAndUpdate(accountId, { isLocked: false, lockingTime: null, lockingReason: null })
  if (account) {
    console.log(`account ${account.address} unlocked with id ${account._id}`)
    return account
  }
  console.log(`no account found to unlock with id ${accountId}`)
}

const withAccount = (func, filterOrLockingFunction) => async (...params) => {
  let account
  if (typeof filterOrLockingFunction === 'function') {
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
    console.log(`unlocking the account ${account.address} with role ${account.role} and bridgeType ${account.bridgeType}`)
    await unlockAccount(account._id)
  } catch (e) {
    console.log(`unlocking the account ${account.address} with role ${account.role} and bridgeType ${account.bridgeType}`)
    await unlockAccount(account._id)
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
  return toChecksumAddress(address)
}

const createAccount = async ({ role, bridgeType, description }) => {
  const lastAccount = await Account.findOne().sort({ childIndex: -1 })
  const lastChildIndex = (lastAccount && lastAccount.childIndex) || 0
  const childIndex = lastChildIndex + 1
  const address = generateAccountAddress(childIndex)
  const account = await new Account({
    childIndex,
    address,
    role,
    bridgeType,
    description
  }).save()
  console.log(`new admin account created, address: ${account.address}`)
  return account
}

const generateCommunityAdminJwt = (accountAddress, appName) => {
  const secret = config.get('api.secret')
  return jwt.sign({
    accountAddress,
    appName,
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
  generateCommunityAdminJwt
}
