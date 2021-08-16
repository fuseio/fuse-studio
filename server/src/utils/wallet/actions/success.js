const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { get } = require('lodash')
const { formatActionData } = require('./utils')

const handleSuccessCreateWalletJob = (action, job) => {
  const formattedData = formatActionData(job.data)
  action.set('status', get(formattedData, 'status'))
  if (!action.walletAddress) {
    action.set('walletAddress', job.data.walletAddress)
  }
  action.set('data', { ...action.data, ...formattedData })
  return action.save()
}

const handleJobSuccess = (action, job) => {
  const formattedData = formatActionData(job.data)
  action.set('status', get(formattedData, 'status', 'succeeded'))
  action.set('data', { ...action.data, ...formattedData })
  return action.save()
}

const handleSubscriptionWebHook = async (data) => {
  return new WalletAction({
    name: 'receiveTokens',
    data,
    status: 'succeeded',
    tokenAddress: data.tokenAddress,
    walletAddress: data.walletAddress
  }).save()
}

const specialActionHandlers = {
  createWallet: handleSuccessCreateWalletJob
}

const successAndUpdateByJob = async (job) => {
  try {
    const walletActions = await WalletAction.find({ job })
    for (let action of walletActions) {
      console.log(`Received action type of ${action.name} was successful`)
      const sucessHandler = specialActionHandlers[action] || handleJobSuccess
      await sucessHandler(action, job)
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  successAndUpdateByJob,
  handleSubscriptionWebHook
}
