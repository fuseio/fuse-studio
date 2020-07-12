const process = require('process')
const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const moment = require('moment')
const { notify } = require('@utils/slack')
const { toWei, fromWei } = require('web3-utils')
const { getWeb3 } = require('@services/web3')
const BigNumber = require('bignumber.js')

const environment = process.env.NODE_ENV || ''
const codeBlock = '`'

const lockedAccounts = async () => {
  const accounts = await Account.find({ isLocked: true })
  const now = moment()
  const threshold = config.get('alerts.lockedAccounts.threshold')
  const network = config.get('network.foreign.name')
  const msgPrefix = `*${environment.toUpperCase()}-${network.toUpperCase()}*`
  let msg
  accounts.forEach(account => {
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
  const accounts = await Account.find({ role: '*' })
  const network = config.get('network.foreign.name')
  const threshold = new BigNumber(toWei(config.get('alerts.lowBalanceAccounts.threshold')))

  const msgPrefix = `*${environment.toUpperCase()}-${network.toUpperCase()}*`

  const web3 = getWeb3({ networkType: network })
  accounts.forEach(async (account) => {
    const balance = await web3.eth.getBalance(account.address)
    if (threshold.isGreaterThan(balance)) {
      const msg = `${msgPrefix}\naccount ${codeBlock}${account.address}${codeBlock} got low balance of ${codeBlock}${fromWei(balance)}${codeBlock}`
      console.warn(msg)
      notify(msg)
    }
  })
}

module.exports = {
  lockedAccounts,
  lowBalanceAccounts
}
