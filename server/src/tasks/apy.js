const utils = require('@utils/apy')

const syncAndCalculateApy = ({ walletAddress, tokenAddress, toBlockNumber }) => {
  return utils.syncAndCalculateApy(walletAddress, tokenAddress, toBlockNumber)
}

module.exports = { syncAndCalculateApy }
