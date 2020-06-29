const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const jwt = require('jsonwebtoken')
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
  console.log(`create new account address: ${account.address}, the jwt is: ${generateAdminJwt(account.address)}`)
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
  unlockAccount,
  withAccount,
  createAccount,
  generateAccounts,
  generateAdminJwt
}
