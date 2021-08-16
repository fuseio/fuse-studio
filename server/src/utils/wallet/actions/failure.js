const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { formatActionData } = require('./utils')

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

module.exports = {
  failAndUpdateByJob
}
