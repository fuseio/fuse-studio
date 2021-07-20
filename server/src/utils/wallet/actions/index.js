const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { get } = require('lodash')
const { createActionFromJob } = require('./create')
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

const handleSuccessDefaultJob = (action, job) => {
  const formattedData = formatActionData(job.data)
  action.set('status', get(formattedData, 'status'))
  action.set('data', { ...action.data, ...formattedData })
  return action.save()
}

const jobSuccessHandlers = {
  createWallet: handleSuccessCreateWalletJob,
  createForeignWallet: handleSuccessDefaultJob,
  fundToken: handleSuccessDefaultJob,
  relay: handleSuccessDefaultJob,
  claimApy: handleSuccessDefaultJob,
  mintDeposited: handleSuccessDefaultJob
}

const handlePendingAction = (action, txHash) => {
  action.set('data.txHash', txHash)
  return action.save()
}

const successAndUpdateByJob = async (job) => {
  const jobHandler = jobSuccessHandlers[job.name]
  if (!jobHandler) {
    console.warn(`No action is defined for ${job.name}`)
    return
  }
  const walletActions = await WalletAction.find({ job })
  for (const action of walletActions) {
    await jobHandler(action, job)
  }
}

const pendingAndUpdateByJob = async (job, hash) => {
  const walletActions = await WalletAction.find({ job })
  console.log(`found ${walletActions.length} - hash ${hash}`)
  for (const action of walletActions) {
    await handlePendingAction(action, hash)
  }
}

const failAndUpdateByJob = async (job) => {
  const walletActions = await WalletAction.find({ job })
  for (const action of walletActions) {
    action.set('status', 'failed')
    action.set('data', { ...action.data, ...formatActionData(job.data) })
    action.set('failedAt', new Date())
    action.set('failReason', job.failReason)
    await action.save()
  }
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

module.exports = {
  createActionFromJob,
  successAndUpdateByJob,
  failAndUpdateByJob,
  formatActionData,
  handleSubscriptionWebHook,
  pendingAndUpdateByJob
}
