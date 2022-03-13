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
  metadata: purchase || get(transactionBody, 'metadata', get(transactionBody, 'tradeInfo')),
  detailedStatus,
  externalId,
  bonusType,
  txHash
}, identity)

module.exports = {
  formatActionData
}
