const process = require('process')
const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const moment = require('moment')
const { notify } = require('@utils/slack')
const { toWei, fromWei } = require('web3-utils')
const { getWeb3 } = require('@services/web3')
const BigNumber = require('bignumber.js')
const { lockAccountWithReason, unlockAccount } = require('@utils/account')

const environment = process.env.NODE_ENV || ''
const codeBlock = '`'
const OUT_OF_GAS = 'out of gas'

const wrapCodeBlock = (value) => `${codeBlock}${value}${codeBlock}`

const lockedAccounts = async () => {
  const accounts = await Account.find({ isLocked: true })
  const now = moment()
  const threshold = config.get('alerts.lockedAccounts.threshold')
  const network = config.get('network.foreign.name')
  const msgPrefix = `*${environment.toUpperCase()}-${network.toUpperCase()}*`
  let msg
  accounts
    .filter(account => !account.lockingReason === OUT_OF_GAS)
    .forEach(account => {
      if (account.lockingTime) {
        const lockingTime = moment(account.lockingTime)
        if (now.diff(lockingTime, 'minutes') > threshold) {
          msg = `${msgPrefix}\naccount ${codeBlock}${account.address}${codeBlock} is locked for more than ${codeBlock}${threshold}${codeBlock} minutes`
          console.warn(msg)
          notify(msg)
        }
      } else {
        msg = `${msgPrefix}\naccount ${codeBlock}${account.address}${codeBlock} is locked and has no locking time`
        console.warn(msg)
        notify(msg)
      }
    })
}

const lowBalanceAccounts = async () => {
  const watchedRoles = ['*', 'wallet']
  for (const role of watchedRoles) {
    await lowBalanceAccountsWithRole(role)
  }
}

const lowBalanceAccountsWithRole = async (role) => {
  const accounts = await Account.find({ role })
  const network = config.get('network.foreign.name')
  const threshold = new BigNumber(toWei(config.get('alerts.lowBalanceAccounts.threshold')))

  const msgPrefix = `*${environment.toUpperCase()}-${network.toUpperCase()}*`

  const web3 = getWeb3({ networkType: network })
  for (const account of accounts) {
    const balance = await web3.eth.getBalance(account.address)
    if (threshold.isGreaterThan(balance)) {
      const msg = `${msgPrefix}\naccount ${wrapCodeBlock(account.address)} with role ${wrapCodeBlock(account.role)} got low balance of ${wrapCodeBlock(fromWei(balance))}`
      console.warn(msg)
      notify(msg)
      if (!account.isLocked) {
        await lockAccountWithReason({ address: account.address }, OUT_OF_GAS)
      }
    } else if (account.isLocked &&
        account.lockingReason === OUT_OF_GAS &&
        threshold.isLessThanOrEqualTo(balance)) {
      console.info(`account ${account.address} received ether, unlocking`)
      await unlockAccount(account.address)
    }
  }
  const numberOflockedAccounts = await Account.find({ isLocked: true, role }).countDocuments()
  const totalNumberOfAccounts = await Account.find({ role }).countDocuments()
  const summaryMsg = `${msgPrefix}\nSummary: ${codeBlock}${numberOflockedAccounts} / ${totalNumberOfAccounts}${codeBlock} account locked for role ${wrapCodeBlock(role)}.`

  console.info(summaryMsg)
  if (numberOflockedAccounts > 0) {
    notify(summaryMsg)
  }
}

module.exports = {
  lockedAccounts,
  lowBalanceAccounts
}
