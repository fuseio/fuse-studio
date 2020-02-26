const process = require('process')
const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const moment = require('moment')
const { notify } = require('@utils/slack')

const environment = process.env.NODE_ENV
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

module.exports = {
  lockedAccounts
}
