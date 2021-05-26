const { get } = require('lodash')
const { getParamsFromMethodData } = require('@utils/abi')
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { formatActionData } = require('./utils')

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
    const tokenAddress = _token.toLowerCase()
    const actionData = formatActionData({ ...job.data, transactionBody: { ...job.data.transactionBody, value: _amount, tokenAddress } })
    const receiverAction = await new WalletAction({
      name: 'receiveTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: actionData,
      tokenAddress,
      walletAddress: _to,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    const senderAction = await new WalletAction({
      name: 'sendTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: actionData,
      walletAddress: _wallet,
      tokenAddress,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    return { receiverAction, senderAction }
  } else if (walletModule === 'TransferManager' && methodName === 'approveTokenAndCallContract') {
    const walletModuleABI = require(`@constants/abi/${walletModule}`)
    const { methodData } = job.data
    const { _wallet, _token, _contract, _amount } = getParamsFromMethodData(walletModuleABI, 'approveTokenAndCallContract', methodData)
    const tokenAddressIn = _token.toLowerCase()
    const tokenAddressOut = get(job, 'data.txMetadata.currencyOut')

    const swapAction = await new WalletAction({
      name: 'swapTokens',
      job: mongoose.Types.ObjectId(job._id),
      data: {
        ...formatActionData(job.data),
        spender: _contract,
        value: _amount,
        tokenAddress: tokenAddressIn
      },
      tokenAddress: [ tokenAddressIn, tokenAddressOut ],
      walletAddress: _wallet,
      communityAddress: job.communityAddress || job.data.communityAddress
    }).save()
    return { swapAction }
  }
}

const handleFundToken = (job) => {
  const data = formatActionData(job.data)
  return new WalletAction({
    name: 'tokenBonus',
    job: mongoose.Types.ObjectId(job._id),
    data,
    tokenAddress: data.tokenAddress,
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
  const data = formatActionData(job.data)
  return new WalletAction({
    name: 'fiat-deposit',
    job: mongoose.Types.ObjectId(job._id),
    data,
    tokenAddress: data.tokenAddress,
    walletAddress: job.data.walletAddress,
    communityAddress: job.data.communityAddress
  }).save()
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

module.exports = {
  createActionFromJob
}
