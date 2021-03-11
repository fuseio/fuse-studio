const { adjustDecimals, fetchToken } = require('@utils/token')
const { get } = require('lodash')

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
  deduceTransactionBodyForFundToken
}
