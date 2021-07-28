const apy = require('@utils/apy')

const claimApy = async (account, { walletAddress, tokenAddress }, job) => {
  return apy.claimApy(account, { walletAddress, tokenAddress }, job)
}

module.exports = {
  claimApy
}
