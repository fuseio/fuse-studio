const { first, last } = require('lodash')
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { formatActionData, getActionsTypes, getRelayBody } = require('./utils')

const makeCreateWalletAction = ({ name } = {}, actionName) => async (job) => {
  const data = formatActionData(job.data)
  return new WalletAction({
    name: name || actionName || job.name,
    job: mongoose.Types.ObjectId(job._id),
    data,
    communityAddress: job.communityAddress || job.data.communityAddress,
    walletAddress: job.data.walletAddress,
    tokenAddress: data.tokenAddress
  }).save()
}

const createWalletAction = makeCreateWalletAction()

const handleReceiveTokens = (job) => {
  const { _to, _amount, _token } = getRelayBody(job).params
  const tokenAddress = _token.toLowerCase()
  const actionData = formatActionData({ ...job.data, transactionBody: { ...job.data.transactionBody, value: _amount, tokenAddress } })
  return new WalletAction({
    name: 'receiveTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: actionData,
    tokenAddress,
    walletAddress: _to,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSendTokens = (job) => {
  const { _amount, _token, _wallet } = getRelayBody(job).params
  const tokenAddress = _token.toLowerCase()
  const actionData = formatActionData({ ...job.data, transactionBody: { ...job.data.transactionBody, value: _amount, tokenAddress } })
  return new WalletAction({
    name: 'sendTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: actionData,
    walletAddress: _wallet,
    tokenAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSwapTokens = (job) => {
  const { params } = getRelayBody(job)
  const { to, amountIn, path } = params
  const walletAddress = to
  const value = amountIn || 0
  const { _contract } = job.data.relayBody.params
  const tokenAddressIn = first(path).toLowerCase()
  const tokenAddressOut = last(path).toLowerCase()

  return new WalletAction({
    name: 'swapTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      spender: _contract,
      value,
      tokenAddress: tokenAddressIn,
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenAddressIn, tokenAddressOut],
    walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleFundToken = (job) => {
  const data = formatActionData(job.data)
  return new WalletAction({
    name: 'tokenBonus',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...data,
      from: job.accountAddress
    },
    tokenAddress: data.tokenAddress,
    walletAddress: job.data.receiverAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSetWalletOwnerJob = makeCreateWalletAction({ name: 'createWallet' })

const makeMintDeposited = makeCreateWalletAction({ name: 'fiat-deposit' })

const specialActionHandlers = {
  receiveTokens: handleReceiveTokens,
  sendTokens: handleSendTokens,
  swapTokens: handleSwapTokens,
  setWalletOwner: handleSetWalletOwnerJob,
  tokenBonus: handleFundToken,
  'fiat-deposit': makeMintDeposited
}

const createActionFromJob = async (job) => {
  try {
    const actionTypes = [getActionsTypes(job)].flat()
    for (let action of actionTypes) {
      console.log(`Received action type of ${action}`)
      const makeActionFunc = specialActionHandlers[action] || createWalletAction
      await makeActionFunc(job, action)
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  createActionFromJob
}
