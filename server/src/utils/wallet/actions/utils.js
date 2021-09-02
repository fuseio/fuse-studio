const { get, pickBy, identity } = require('lodash')

const formatActionData = ({ transactionBody, txHash, bonusType, externalId, detailedStatus, purchase }) => pickBy({
  status: get(transactionBody, 'status'),
  value: get(transactionBody, 'value', 0).toString(),
  tokenName: get(transactionBody, 'tokenName', ''),
  tokenDecimal: get(transactionBody, 'tokenDecimal', ''),
  tokenSymbol: get(transactionBody, 'asset', ''),
  tokenAddress: get(transactionBody, 'tokenAddress', '').toLowerCase(),
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

const actionsMapping = {
  'CommunityManager': {
    'joinCommunity': 'joinCommunity'
  },
  'TransferManager': {
    'transferToken': ['sendTokens', 'receiveTokens']
  },
  'FuseswapRouter': {
    'swapExactTokensForTokens': 'swapTokens',
    'swapTokensForExactTokens': 'swapTokens',
    'swapExactETHForTokens': 'swapTokens',
    'swapTokensForExactETH': 'swapTokens',
    'swapExactTokensForETH': 'swapTokens',
    'swapETHForExactTokens': 'swapTokens',
    'swapExactTokensForTokensSupportingFeeOnTransferTokens': 'swapTokens',
    'swapExactETHForTokensSupportingFeeOnTransferTokens': 'swapTokens',
    'swapExactTokensForETHSupportingFeeOnTransferTokens': 'swapTokens',
    'addLiquidity': 'addLiquidity',
    'addLiquidityETH': 'addLiquidity',
    'removeLiquidity': 'removeLiquidity',
    'removeLiquidityETH': 'removeLiquidity'
  },
  'MultiRewardProgram': {
    'stake': 'stakeLiquidity',
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

module.exports = {
  formatActionData,
  getActionsTypes,
  getRelayBody
}
