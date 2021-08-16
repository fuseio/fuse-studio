const { get } = require('lodash')
const { getParamsFromMethodData } = require('@utils/abi')
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { formatActionData, getActionsTypes } = require('./utils')

const makeCreateWalletAction = ({ name } = {}) => async (job) => {
  const data = formatActionData(job.data)
  return new WalletAction({
    name: name || job.name,
    job: mongoose.Types.ObjectId(job._id),
    data,
    communityAddress: job.communityAddress || job.data.communityAddress,
    walletAddress: job.data.walletAddress,
    tokenAddress: data.tokenAddress
  }).save()
}

const createWalletAction = makeCreateWalletAction()

const handleReceiveTokens = (job) => {
  const { walletModule } = job.data
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  const { methodData } = job.data
  const { _to, _amount, _token } = getParamsFromMethodData(walletModuleABI, 'transferToken', methodData)
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
  const { walletModule } = job.data
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  const { methodData } = job.data
  const { _amount, _token, _wallet } = getParamsFromMethodData(walletModuleABI, 'transferToken', methodData)
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
  const { walletModule } = job.data
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  const { methodData } = job.data
  const { _wallet, _token, _contract, _amount } = getParamsFromMethodData(walletModuleABI, 'approveTokenAndCallContract', methodData)
  const tokenAddressIn = _token.toLowerCase()
  const tokenAddressOut = get(job, 'data.txMetadata.currencyOut')

  return new WalletAction({
    name: 'swapTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      spender: _contract,
      value: _amount,
      tokenAddress: tokenAddressIn,
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenAddressIn, tokenAddressOut],
    walletAddress: _wallet,
    communityAddress: job.communityAddress || job.data.communityAddress
  })
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
      await makeActionFunc(job)
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  createActionFromJob
}
