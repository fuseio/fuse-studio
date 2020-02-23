const config = require('config')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const moment = require('moment')
const { notify } = require('@utils/slack')

const codeBlock = '`'

const lockedAccounts = async () => {
  const accounts = await Account.find({ isLocked: true })
  const now = moment()
  const threshold = config.get('alerts.lockedAccounts.threshold')
  let msg
  accounts.forEach(account => {
    if (account.lockingTime) {
      const lockingTime = moment(account.lockingTime)
      if (now.diff(lockingTime, 'minutes') > threshold) {
        msg = `account ${codeBlock}${account.address}${codeBlock} is locked for more than ${codeBlock}${threshold}${codeBlock} minutes`
        console.warn(msg)
        notify(msg)
      }
    } else {
      msg = `account ${codeBlock}${account.address}${codeBlock} is locked and has no locking time`
      console.warn(msg)
      notify(msg)
    }
  })
}

module.exports = {
  lockedAccounts
}
