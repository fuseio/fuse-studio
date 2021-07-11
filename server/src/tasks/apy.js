const { calculate } = require('@utils/apy')

const calculateApy = ({ walletAddress, tokenAddress }) => {
  return calculate(walletAddress, tokenAddress)
}

module.exports = { calculateApy }
