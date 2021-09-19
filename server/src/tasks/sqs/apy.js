const apy = require('@utils/apy')

const claimApy = async (account, data, job) => {
  return apy.claimApy(account, data, job)
}

module.exports = {
  claimApy
}
