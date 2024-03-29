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
  const network = config.get('network.home.name')
  const msgPrefix = `*${environment.toUpperCase()}-${network.toUpperCase()}*`
  accounts
    .filter(account => !account.lockingReason === OUT_OF_GAS)
    .forEach(account => {
      if (account.lockingTime) {
        const lockingTime = moment(account.lockingTime)
        if (now.diff(lockingTime, 'minutes') > threshold) {
          const msg = `${msgPrefix}\naccount ${codeBlock}${account.address}${codeBlock} is locked for more than ${codeBlock}${threshold}${codeBlock} minutes`
          console.warn(msg)
          notify(msg)
        }
      } else {
        const msg = `${msgPrefix}\naccount ${codeBlock}${account.address}${codeBlock} is locked and has no locking time`
        console.warn(msg)
        notify(msg)
      }
    })
}

const lowBalanceAccounts = async () => {
  const watchedOptions = config.get('alerts.lowBalanceAccounts.options')
  for (const option of watchedOptions) {
    await lowBalanceAccountsWithCond(option)
  }
}

const lowBalanceAccountsWithCond = async ({ role, bridgeType }) => {
  const query = { role, bridgeType: bridgeType || { '$exists': false } }
  bridgeType = bridgeType || 'foreign'
  const accounts = await Account.find(query)
  const network = config.get(`network.${bridgeType}.name`)
  const threshold = new BigNumber(toWei(config.get('alerts.lowBalanceAccounts.threshold')))

  const msgPrefix = `*${environment.toUpperCase()}-${network.toUpperCase()}*`

  const web3 = getWeb3({ bridgeType })
  for (const account of accounts) {
    const balance = await web3.eth.getBalance(account.address)
    if (threshold.isGreaterThan(balance)) {
      const msg = `${msgPrefix}\naccount ${wrapCodeBlock(account.address)} with role ${wrapCodeBlock(account.role)} got low balance of ${wrapCodeBlock(fromWei(balance))} on - ${wrapCodeBlock(network)} bridgeType - ${wrapCodeBlock(bridgeType)}`
      console.warn(msg)
      if (!account.isLocked) {
        notify(msg)
        await lockAccountWithReason({ _id: account._id }, OUT_OF_GAS)
      }
    } else if (account.isLocked &&
      account.lockingReason === OUT_OF_GAS &&
      threshold.isLessThanOrEqualTo(balance)) {
      console.info(`account ${account.address} received ether, unlocking`)
      await unlockAccount(account._id)
    }
  }
  // summing up the role
  const numberOflockedAccounts = await Account.find({ ...query, isLocked: true }).countDocuments()
  const totalNumberOfAccounts = await Account.find(query).countDocuments()
  const summaryMsg = `${msgPrefix}\nSummary: ${codeBlock}${numberOflockedAccounts} / ${totalNumberOfAccounts}${codeBlock} account locked for role ${wrapCodeBlock(role)} on ${wrapCodeBlock(network)}.`

  console.info(summaryMsg)
  if (numberOflockedAccounts > 0) {
    notify(summaryMsg)
  }
}

module.exports = {
  lockedAccounts,
  lowBalanceAccounts
}
