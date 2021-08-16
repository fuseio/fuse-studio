const utils = require('@utils/apy')

const calculateApy = ({ walletAddress, tokenAddress }) => {
  return utils.calculateApy(walletAddress, tokenAddress)
}

module.exports = { calculateApy }
