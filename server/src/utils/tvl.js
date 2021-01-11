const { createNetwork } = require('@utils/web3')
const config = require('config')
const { fetchBalance, fetchTokenPrice } = require('./token')
const mongoose = require('mongoose')
const AccountBalance = mongoose.model('AccountBalance')
const BigNumber = require('bignumber.js')
const { fetchBridgedTokenPairs } = require('@utils/graph')
const Promise = require('bluebird')

const concurrency = 10

const fetchTokenBalances = async (accountAddress, tokenList, network) => {
  const balances = {}
  await Promise.map(tokenList, async (tokenAddress) => {
    balances[tokenAddress] = (await fetchBalance(network, tokenAddress, accountAddress)).toString()
  }, { concurrency })
  return balances
}

const fetchTokenPricesInUSD = async (tokenList) => {
  const tokenPrices = {}
  await Promise.map(tokenList, async (tokenAddress) => {
    const { priceUSD, date } = await fetchTokenPrice(tokenAddress)
    tokenPrices[tokenAddress] = priceUSD ? { priceUSD, date } : undefined
  }, { concurrency })
  return tokenPrices
}

const computeTlv = (tokenBalances, tokenPrices) =>
  Object.entries(tokenBalances).reduce((sum, [tokenAddress, tokenBalance]) => sum.plus(new BigNumber(tokenBalance).multipliedBy(tokenPrices[tokenAddress].priceUSD)), new BigNumber(0))

const filterTokenBalances = (tokenBalances, tokenPrices) =>
  Object.fromEntries(Object.entries(tokenBalances).filter(([ address, balance ]) => !!tokenPrices[address]))

const calculateAccountTvl = async (accountAddress, foreignNetwork) => {
  const tokenList = (await fetchBridgedTokenPairs()).map(({ foreignAddress }) => foreignAddress)
  let tokenBalances = await fetchTokenBalances(accountAddress, tokenList, foreignNetwork)
  const tokenPrices = await fetchTokenPricesInUSD(tokenList)

  const filteredTokenBalances = filterTokenBalances(tokenBalances, tokenPrices)
  const tvlUSDinWei = computeTlv(filteredTokenBalances, tokenPrices)
  const tvlUSD = tvlUSDinWei.div(new BigNumber(10).pow(18))

  new AccountBalance({
    address: accountAddress,
    bridgeType: 'foreign',
    date: new Date(),
    tvlUSD,
    tokenBalances: filteredTokenBalances,
    description: 'multi-amb-erc20-to-erc677'
  }).save()
  console.log(`tvl for ${accountAddress} is ${tvlUSD} USD`)
}

const calculateTvl = async () => {
  const foreignNetwork = createNetwork('foreign')
  const accountList = [config.get('network.foreign.addresses.MultiBridgeMediator')]
  for (const accountAddress of accountList) {
    calculateAccountTvl(accountAddress, foreignNetwork)
  }
}

module.exports = {
  fetchTokenBalances,
  fetchTokenPricesInUSD,
  calculateTvl
}
