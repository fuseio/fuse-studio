const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { getParamsFromMethodData } = require('@utils/abi')
const { get } = require('lodash')

const makeFromCreateWalletJob = (job) => {
  return [new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
    communityAddress: job.communityAddress || job.data.communityAddress
  })]
}

const makeFromRelayJob = (job) => {
  const { walletModule, methodName } = job.data
  if (walletModule === 'CommunityManager' && methodName === 'joinCommunity') {
    return [new WalletAction({
      name: 'joinCommunity',
      job: mongoose.Types.ObjectId(job._id),
      walletAddress: job.data.walletAddress,
      communityAddress: job.communityAddress || job.data.communityAddress
    })]
  } else if (walletModule === 'TransferManager' && methodName === 'transferToken') {
    const walletModuleABI = require(`@constants/abi/${walletModule}`)
    const { methodData } = job.data
    const { _to, _amount, _token, _wallet } = getParamsFromMethodData(walletModuleABI, 'transferToken', methodData)

    const receiverAction = new WalletAction({
      name: 'receiveTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        _amount,
        _token
      },
      walletAddress: _to,
      communityAddress: job.communityAddress || job.data.communityAddress
    })
    const senderAction = new WalletAction({
      name: 'sendTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        _amount,
        _token
      },
      walletAddress: _wallet,
      communityAddress: job.communityAddress || job.data.communityAddress
    })
    return [receiverAction, senderAction]
  }
}

const makeFromFundToken = (job) => {
  return [new WalletAction({
    name: 'tokenBonus',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      bonusType: get(job, 'data.bonusType')
    },
    communityAddress: job.communityAddress || job.data.communityAddress
  })]
}

const makeFromSetWalletOwnerJob = (job) => {
  return [new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
    walletAddress: job.data.walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  })]
}

const makeActions = {
  createWallet: makeFromCreateWalletJob,
  createForeignWallet: makeFromCreateWalletJob,
  relay: makeFromRelayJob,
  fundToken: makeFromFundToken,
  setWalletOwner: makeFromSetWalletOwnerJob
}

const createActionFromJob = async (job) => {
  try {
    const makeActionFunc = makeActions[job.name]
    if (!makeActionFunc) {
      console.warn(`No action is defined for ${job.name}`)
      return
    }
    const actions = makeActionFunc(job)
    for (const action of actions) {
      await action.save()
    }
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
  relay: makeJobSucceeded
}

const successAndUpdateByJob = async (job) => {
  const makeSuccessDocFunc = makeSuccess[job.name]
  if (!makeSuccessDocFunc) {
    console.warn(`No action is defined for ${job.name}`)
    return
  }
  await WalletAction.updateMany({ job }, makeSuccessDocFunc(job))
}

module.exports = {
  createActionFromJob,
  successAndUpdateByJob
}
