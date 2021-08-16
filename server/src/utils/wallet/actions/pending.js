const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')

const handlePendingAction = (action, txHash) => {
  action.set('data.txHash', txHash)
  return action.save()
}

const pendingAndUpdateByJob = async (job, hash) => {
  const walletActions = await WalletAction.find({ job })

  console.log(`found ${walletActions.length} - hash ${hash}`)
  for (const action of walletActions) {
    await handlePendingAction(action, hash)
  }
}

module.exports = {
  pendingAndUpdateByJob
}
