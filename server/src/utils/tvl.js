// const Promise = require('bluebird')
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

const tvlFormula = (tokenBalances, tokenPrices) =>
  Object.entries(tokenBalances).reduce((sum, [tokenAddress, tokenBalance]) => sum.plus(new BigNumber(tokenBalance).multipliedBy(tokenPrices[tokenAddress].priceUSD)), new BigNumber(0))

const filterTokenBalances = (tokenBalances, tokenPrices) =>
  Object.fromEntries(Object.entries(tokenBalances).filter(([ address, balance ]) => !!tokenPrices[address]))

const calculateAccountTvl = async (accountAddress, foreignNetwork) => {
  const tokenList = (await fetchBridgedTokenPairs()).map(({ foreignAddress }) => foreignAddress)
  let tokenBalances = await fetchTokenBalances(accountAddress, tokenList, foreignNetwork)
  const tokenPrices = await fetchTokenPricesInUSD(tokenList)

  const filteredTokenBalances = filterTokenBalances(tokenBalances, tokenPrices)
  const tvl = tvlFormula(filteredTokenBalances, tokenPrices)
  new AccountBalance({
    address: accountAddress,
    bridgeType: 'foreign',
    date: new Date(),
    tokenBalances: filteredTokenBalances,
    description: 'multi-amb-erc20-to-erc677'
  }).save()
  console.log((await fetchBridgedTokenPairs()).filter(({ foreignAddress }) => !!tokenPrices[foreignAddress]).map(({ foreignAddress, symbol }) => ({ foreignAddress, symbol, balance: filteredTokenBalances[foreignAddress], priceUSD: tokenPrices[foreignAddress].priceUSD, date: new Date(tokenPrices[foreignAddress].date * 1000) })))
  console.log(`tvl for ${accountAddress} is ${tvl.div(new BigNumber(10).pow(18))} USD`)
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
