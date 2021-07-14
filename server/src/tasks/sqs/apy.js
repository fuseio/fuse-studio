const apy = require('@utils/apy')

const claimApy = async (account, { walletAddress, tokenAddress }, job) => {
  return apy.claimApy(account, { walletAddress, tokenAddress })
}

module.exports = {
  claimApy
}
