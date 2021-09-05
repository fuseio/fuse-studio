const config = require('config')
const { first, last, get, isFunction } = require('lodash')
const mongoose = require('mongoose')
const WalletAction = mongoose.model('WalletAction')
const { formatActionData } = require('./utils')
const { createContract } = require('@services/web3/home')
const MultiRewardProgramABI = require('@constants/abi/MultiRewardProgram')

const NATIVE_ADDRESS = config.get('network.home.native.address')

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
  const { _to, _amount, _token } = getRelayBody(job).params
  const tokenAddress = _token.toLowerCase()
  const actionData = formatActionData({ ...job.data, transactionBody: { ...job.data.transactionBody, value: _amount, tokenAddress } })
  return new WalletAction({
    name: 'receiveTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: actionData,
    tokenAddress,
    tokensIn: {
      tokenAddress,
      amount: _amount
    },
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
    tokensOut: {
      tokenAddress,
      amount: _amount
    },
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSwapTokens = (job) => {
  const { params } = getRelayBody(job)
  const { to, amountIn, path } = params
  const walletAddress = to
  const value = amountIn || 0
  const tokenAddressIn = first(path).toLowerCase()
  const tokenAddressOut = last(path).toLowerCase()

  return new WalletAction({
    name: 'swapTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      value,
      tokenAddress: tokenAddressIn,
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenAddressIn, tokenAddressOut],
    tokensIn: {
      tokenAddress: tokenAddressIn,
      amount: value
    },
    tokensOut: {
      tokenAddress: tokenAddressOut
    },
    walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSwapEthTokens = (job) => {
  const { params } = getRelayBody(job)
  const { to, path, amountOutMin } = params
  const { _value } = job.data.relayBody.params
  const walletAddress = to
  const tokenAddressOut = NATIVE_ADDRESS
  const tokenAddressIn = last(path).toLowerCase()

  return new WalletAction({
    name: 'swapTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      value: _value,
      tokenAddress: tokenAddressIn,
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenAddressIn, tokenAddressOut],
    tokensIn: {
      tokenAddress: tokenAddressIn,
      amount: amountOutMin
    },
    tokensOut: {
      tokenAddress: tokenAddressOut,
      amount: _value
    },
    walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleSwapTokensEth = (job) => {
  const { params } = getRelayBody(job)
  const { to, path, amountOutMin } = params
  const { _value } = job.data.relayBody.params
  const walletAddress = to
  const tokenAddressIn = first(path).toLowerCase()
  const tokenAddressOut = NATIVE_ADDRESS

  return new WalletAction({
    name: 'swapTokens',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      value: _value,
      tokenAddress: tokenAddressIn,
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenAddressIn, tokenAddressOut],
    tokensIn: {
      tokenAddress: tokenAddressIn,
      amount: _value
    },
    tokensOut: {
      tokenAddress: tokenAddressOut,
      amount: amountOutMin
    },
    walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleAddLiquidity = (job) => {
  const { params } = getRelayBody(job)
  const { to } = params
  const walletAddress = to
  // for AddLiquidityETh arguments are different
  const { tokenA, tokenB, amountADesired, amountBDesired } = params

  return new WalletAction({
    name: 'addLiquidity',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenA, tokenB],
    tokensOut: [{
      tokenAddress: tokenA,
      amount: amountADesired
    },
    {
      tokenAddress: tokenB,
      amount: amountBDesired
    }],
    walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleAddLiquidityEth = (job) => {
  const { params } = getRelayBody(job)
  const { to } = params
  const walletAddress = to
  const { _value } = job.data.relayBody.params
  const { token, amountTokenDesired } = params

  return new WalletAction({
    name: 'addLiquidity',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [token, NATIVE_ADDRESS],
    tokensOut: [{
      tokenAddress: token,
      amount: amountTokenDesired
    },
    {
      tokenAddress: NATIVE_ADDRESS,
      amount: _value
    }],
    walletAddress,
    communityAddress: job.communityAddress || job.data.communityAddress
  }).save()
}

const handleStake = async (job) => {
  const { params } = getRelayBody(job)
  const { amount } = params
  const { _wallet, _contract } = job.data.relayBody.params
  const stakingContract = createContract(MultiRewardProgramABI, _contract)
  const tokenAddress = await stakingContract.methods.stakingToken().call()
  const walletAddress = _wallet
  return new WalletAction({
    name: 'stakeLiquidity',
    job: mongoose.Types.ObjectId(job._id),
    data: {
      ...formatActionData(job.data),
      value: amount,
      tokenAddress,
      timestamp: (Math.round(new Date().getTime() / 1000)).toString()
    },
    tokenAddress: [tokenAddress],
    tokensOut: {
      tokenAddress: tokenAddress,
      amount
    },
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
  swapTokens: handleSwapTokens,
  setWalletOwner: handleSetWalletOwnerJob,
  tokenBonus: handleFundToken,
  addLiquidity: handleAddLiquidity,
  'fiat-deposit': makeMintDeposited
}

const actionsMapping = {
  'CommunityManager': {
    'joinCommunity': 'joinCommunity'
  },
  'TransferManager': {
    'transferToken': [handleSendTokens, handleReceiveTokens]
  },
  'FuseswapRouter': {
    'swapExactTokensForTokens': handleSwapTokens,
    'swapTokensForExactTokens': handleSwapTokens,
    'swapExactETHForTokens': handleSwapEthTokens,
    'swapTokensForExactETH': handleSwapTokensEth,
    'swapExactTokensForETH': handleSwapTokensEth,
    'swapETHForExactTokens': handleSwapEthTokens,
    'swapExactTokensForTokensSupportingFeeOnTransferTokens': handleSwapTokens,
    'swapExactETHForTokensSupportingFeeOnTransferTokens': handleSwapEthTokens,
    'swapExactTokensForETHSupportingFeeOnTransferTokens': handleSwapTokensEth,
    'addLiquidity': handleAddLiquidity,
    'addLiquidityETH': handleAddLiquidityEth,
    'removeLiquidity': 'removeLiquidity',
    'removeLiquidityETH': 'removeLiquidity'
  },
  'MultiRewardProgram': {
    'stake': handleStake,
    'withdraw': 'withdrawLiquidity',
    'getReward': 'claimReward'
  }
}

const getRelayBody = (job) => get(job, 'data.relayBody.nested', get(job, 'data.relayBody'))

const getActionsTypes = (job) => {
  if (job.name !== 'relay') {
    return job.name
  }
  const { contractName, methodName } = getRelayBody(job)
  console.log({ contractName, methodName })
  return get(actionsMapping, `${contractName}.${methodName}`)
}

const createActionFromJob = async (job) => {
  try {
    const actionTypes = [getActionsTypes(job)].flat()
    for (let action of actionTypes) {
      console.log(`Received action type of ${action}`)
      const makeActionFunc = isFunction(action) ? action : specialActionHandlers[action] || createWalletAction
      await makeActionFunc(job, action)
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  createActionFromJob,
  getRelayBody,
  getActionsTypes
}
