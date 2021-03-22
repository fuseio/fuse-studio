const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { getParamsFromMethodData } = require('@utils/abi')
const { get, pickBy, identity } = require('lodash')

const formatActionData = ({ transactionBody, txHash, bonusType, externalId, detailedStatus, purchase }) => pickBy({
  status: get(transactionBody, 'status'),
  value: get(transactionBody, 'value', 0),
  tokenName: get(transactionBody, 'tokenName', ''),
  tokenDecimal: get(transactionBody, 'tokenDecimal', ''),
  tokenSymbol: get(transactionBody, 'asset', ''),
  tokenAddress: get(transactionBody, 'tokenAddress', ''),
  from: get(transactionBody, 'from', ''),
  to: get(transactionBody, 'to', ''),
  blockNumber: get(transactionBody, 'blockNumber'),
  communityName: get(transactionBody, 'communityName', ''),
  metadata: purchase || get(transactionBody, 'tradeInfo'),
  detailedStatus,
  externalId,
  bonusType,
  txHash
}, identity)

const handleCreateWalletJob = async (job) => {
  return new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
    data: formatActionData(job.data),
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
      data: formatActionData(job.data),
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
        ...formatActionData(job.data),
        value: _amount,
        tokenAddress: _token
      },
      walletAddress: _to,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    const senderAction = await new WalletAction({
      name: 'sendTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        ...formatActionData(job.data),
        value: _amount,
        tokenAddress: _token
      },
      walletAddress: _wallet,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    return { receiverAction, senderAction }
  } else if (walletModule === 'TransferManager' && methodName === 'approveTokenAndCallContract') {
    const walletModuleABI = require(`@constants/abi/${walletModule}`)
    const { methodData } = job.data
    const { _wallet, _token, _contract, _amount } = getParamsFromMethodData(walletModuleABI, 'approveTokenAndCallContract', methodData)
    const swapAction = await new WalletAction({
      name: 'swapTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        ...formatActionData(job.data),
        spender: _contract,
        value: _amount,
        tokenAddress: _token
      },
      walletAddress: _wallet,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    return { swapAction }
  }
}

const handleFundToken = (job) => {
  return new WalletAction({
    name: 'tokenBonus',
    job: mongoose.Types.ObjectId(job._id),
    data: formatActionData(job.data),
    walletAddress: job.data.receiverAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSetWalletOwnerJob = (job) => {
  return new WalletAction({
    name: 'createWallet',
    job: mongoose.Types.ObjectId(job._id),
    data: formatActionData(job.data),
    walletAddress: job.data.walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const makeMintDeposited = async (job) => {
  const action = await WalletAction.findOne({ 'data.externalId': job.data.externalId })
  action.set('job', mongoose.Types.ObjectId(job._id))
  action.set('data', { ...action.data, ...formatActionData(job.data) })
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

const handleSuccessMintDeposited = (action, job) => {
  const formattedData = formatActionData(job.data)
  action.set('status', get(formattedData, 'status'))
  action.set('data', { ...action.data, ...formattedData })
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
