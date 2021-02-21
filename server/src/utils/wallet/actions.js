const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { getParamsFromMethodData } = require('@utils/abi')
const { get } = require('lodash')
const { adjustDecimals, fetchToken } = require('@utils/token')

const handleCreateWalletJob = async (job) => {
  return new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
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
        _amount,
        _token
      },
      walletAddress: _to,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    const senderAction = await new WalletAction({
      name: 'sendTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        _amount,
        _token
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
    walletAddress: job.data.walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const makeMintDeposited = async (job) => {
  const action = await WalletAction.findOne({ 'data.externalId': job.data.externalId })
  action.set('data.detailedStatus', 'minting')
  action.set('job', mongoose.Types.ObjectId(job._id))
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

const makeJobSucceeded = () => ({ status: 'succeeded' })

const makeSuccess = {
  createWallet: (job) => ({ walletAddress: job.data.walletAddress, status: 'succeeded' }),
  createForeignWallet: makeJobSucceeded,
  fundToken: makeJobSucceeded,
  relay: makeJobSucceeded,
  mintDeposited: () => ({ status: 'succeeded', 'data.detailedStatus': 'succeeded' })
}

const successAndUpdateByJob = async (job) => {
  const makeSuccessDocFunc = makeSuccess[job.name]
  if (!makeSuccessDocFunc) {
    console.warn(`No action is defined for ${job.name}`)
    return
  }
  await WalletAction.updateMany({ job }, makeSuccessDocFunc(job))
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
