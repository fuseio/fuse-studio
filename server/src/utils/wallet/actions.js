const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { getParamsFromMethodData } = require('@utils/abi')
const { get } = require('lodash')
const { adjustDecimals, fetchToken } = require('@utils/token')

const handleCreateWalletJob = async (job) => {
  return new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
    data: job.data,
    communityAddress: job.communityAddress || job.data.communityAddress,
    walletAddress: job.data.walletAddress
  }).save()
}

const handleRelayJob = async (job) => {
  const { walletModule, methodName } = job.data
  if (walletModule === 'CommunityManager' && methodName === 'joinCommunity') {
    return new WalletAction({
      name: 'joinCommunity',
      job: mongoose.Types.ObjectId(job._id),
      data: job.data,
      walletAddress: job.data.walletAddress,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
  } else if (walletModule === 'TransferManager' && methodName === 'transferToken') {
    const walletModuleABI = require(`@constants/abi/${walletModule}`)
    const { methodData } = job.data
    const { _to, _amount, _token, _wallet } = getParamsFromMethodData(walletModuleABI, 'transferToken', methodData)

    const receiverAction = await new WalletAction({
      name: 'receiveTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        ...job.data,
        amount: _amount,
        tokenAddress: _token
      },
      walletAddress: _to,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    const senderAction = await new WalletAction({
      name: 'sendTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        amount: _amount,
        tokenAddress: _token
      },
      walletAddress: _wallet,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    return { receiverAction, senderAction }
  }
}

const handleFundToken = (job) => {
  return new WalletAction({
    name: 'tokenBonus',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...job.data,
      bonusType: get(job, 'data.bonusType')
    },
    walletAddress: job.data.receiverAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSetWalletOwnerJob = (job) => {
  return new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
    data: job.data,
    walletAddress: job.data.walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const makeMintDeposited = async (job) => {
  const action = await WalletAction.findOne({ 'data.externalId': job.data.externalId })
  action.set('job', mongoose.Types.ObjectId(job._id))
  action.set('data', { ...action.data, ...job.data })
  action.set('data.detailedStatus', 'minting')
  return action.save()
}

const jobCreationHandlers = {
  createWallet: handleCreateWalletJob,
  createForeignWallet: handleCreateWalletJob,
  relay: handleRelayJob,
  fundToken: handleFundToken,
  mintDeposited: makeMintDeposited,
  setWalletOwner: handleSetWalletOwnerJob
}

const createActionFromJob = async (job) => {
  try {
    const makeActionFunc = jobCreationHandlers[job.name]
    if (!makeActionFunc) {
      console.warn(`No action is defined for ${job.name}`)
      return
    }
    const actions = await makeActionFunc(job)
    return actions
  } catch (err) {
    console.error(err)
  }
}

const handleSuccessCreateWalletJob = (action, job) => {
  action.set('status', 'succeeded')
  if (!action.walletAddress) {
    action.set('walletAddress', job.data.walletAddress)
  }
  action.set('data', { ...action.data, ...job.data })
  return action.save()
}

const handleSuccessDefaultJob = (action, job) => {
  action.set('status', 'succeeded')
  action.set('data', { ...action.data, ...job.data })
  return action.save()
}

const handleSuccessMintDeposited = (action, job) => {
  action.set('status', 'succeeded')
  action.set('data', { ...action.data, ...job.data })
  action.set('data.detailedStatus', 'succeeded')
  return action.save()
}
const jobSuccessHandlers = {
  createWallet: handleSuccessCreateWalletJob,
  createForeignWallet: handleSuccessDefaultJob,
  fundToken: handleSuccessDefaultJob,
  relay: handleSuccessDefaultJob,
  mintDeposited: handleSuccessMintDeposited
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

const deduceTransactionBodyForFundToken = async (plugins, params) => {
  const to = get(params, 'receiverAddress')
  const bonusType = get(params, 'bonusType')
  const tokenAddress = get(params, 'tokenAddress')
  const { decimals, symbol, name } = await fetchToken(tokenAddress)
  const bonusAmount = get(plugins, `${bonusType}Bonus.${bonusType}Info.amount`)
  const amount = adjustDecimals(bonusAmount, 0, decimals)
  return {
    value: amount,
    to,
    tokenName: name,
    tokenDecimal: parseInt(decimals),
    tokenSymbol: symbol,
    tokenAddress
  }
}

module.exports = {
  createActionFromJob,
  successAndUpdateByJob,
  deduceTransactionBodyForFundToken
}
