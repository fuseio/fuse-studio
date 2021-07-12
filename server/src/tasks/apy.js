const { calculate } = require('@utils/apy')

const calculateApy = ({ walletAddress, tokenAddress }) => {
  return calculate(walletAddress, tokenAddress)
}


const claimApy = async ({ walletAddress, tokenAddress, decimals }, job) => {
  await calculate(walletAddress, tokenAddress)
  const f
}

module.exports = { calculateApy }
