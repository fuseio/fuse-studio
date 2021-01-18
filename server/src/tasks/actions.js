const BigNumber = require('bignumber.js')
const mongoose = require('mongoose')
const ActionOnRelay = mongoose.model('ActionOnRelay')
const taskManager = require('@services/taskManager')
const { getNetwork } = require('@services/web3')
const utils = require('@utils/token')

const initiateActions = async () => {
  const actions = await ActionOnRelay.find({ status: 'WAITING' })
  const balances = {}
  for (let action of actions) {
    const { tokenAddress } = action
    const network = getNetwork(action)
    const balance = balances[tokenAddress] ||
      await utils.fetchBalance(network, action.tokenAddress, action.accountAddress)
    if (new BigNumber(balance).isGreaterThanOrEqualTo(action.data.amount.toString())) {
      balances[tokenAddress] = new BigNumber(balance).minus(action.data.amount)
      action.status = 'READY'
      await action.save()
      taskManager.now('mintOnRelay', { actionOnRelayId: action._id, initiatorId: action.initiatorId, accountAddress: action.accountAddress, ...action.data })
    }
  }
}

module.exports = {
  initiateActions
}
