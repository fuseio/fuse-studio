const utils = require('@utils/apy')

const syncAndCalculateApy = ({ walletAddress, tokenAddress }) => {
  return utils.syncAndCalculateApy(walletAddress, tokenAddress)
}

module.exports = { syncAndCalculateApy }
