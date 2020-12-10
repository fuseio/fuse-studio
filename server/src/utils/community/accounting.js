const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const config = require('config')
const { toWei } = require('web3-utils')
const BigNumber = require('bignumber.js')

const balance = toWei(config.get('community.initialBalance'))
const calculateExpenses = async (communityAddress) => {
  const response = await QueueJob.aggregate([{ $match: { communityAddress } }])
    .group({
      _id: { communityAddress: '$communityAddress' },
      expenses: { $sum: '$data.txFee' }
    })
  return { expenses: response[0].expenses.toString() }
}

const countTransactions = async (communityAddress) => {
  const response = await QueueJob.aggregate([{ $match: { communityAddress } }]).count('txCount')
  return response[0]
}

const availableBalance = async (communityAddress) => {
  const { expenses } = await calculateExpenses(communityAddress)
  return { balance: new BigNumber(balance).minus(expenses).toString() }
}

const isAllowedToRelay = async (communityAddress) => {
  const { balance } = await availableBalance(communityAddress)
  return new BigNumber(balance).isGreaterThan(0)
}

module.exports = {
  availableBalance,
  calculateExpenses,
  countTransactions,
  isAllowedToRelay
}
