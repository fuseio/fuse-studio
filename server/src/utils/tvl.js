// const Promise = require('bluebird')
const { createNetwork } = require('@utils/web3')
const { fetchBalance, fetchTokenPrice } = require('./token')
const mongoose = require('mongoose')
const AccountBalance = mongoose.model('AccountBalance')
const BigNumber = require('bignumber.js')
const { fetchBridgedTokenPairs } = require('@utils/graph')

const fetchTokenBalances = async (accountAddress, tokenList, network) => {
  const balances = {}
  for (const tokenAddress of tokenList) {
    balances[tokenAddress] = (await fetchBalance(network, tokenAddress, accountAddress)).toString()
  }
  return balances
}

const fetchTokenPricesInUSD = async (tokenList) => {
  const tokenPrices = {}
  for (const tokenAddress of tokenList) {
    const { priceUSD } = await fetchTokenPrice(tokenAddress)
    tokenPrices[tokenAddress] = priceUSD
  }
  return tokenPrices
}

const accountTvlFormula = (tokenBalances, tokenPrices) =>
  Object.entries(tokenBalances).reduce((sum, [tokenAddress, tokenBalance]) => sum.plus(new BigNumber(tokenBalance).multipliedBy(tokenPrices[tokenAddress])), new BigNumber(0))

const filterTokenBalances = (tokenBalances, tokenPrices) =>
  Object.fromEntries(Object.entries(tokenBalances).filter(([ address, balance ]) => !!tokenPrices[address]))

const calculateAccountTvl = async (accountAddress, foreignNetwork) => {
  const tokenList = (await fetchBridgedTokenPairs()).map(({ foreignAddress }) => foreignAddress)
  let tokenBalances = await fetchTokenBalances(accountAddress, tokenList, foreignNetwork)
  const tokenPrices = await fetchTokenPricesInUSD(tokenList)
  const filteredTokenBalances = filterTokenBalances(tokenBalances, tokenPrices)
  const tvl = accountTvlFormula(filteredTokenBalances, tokenPrices)
  new AccountBalance({
    address: accountAddress,
    bridgeType: 'foreign',
    tokenBalances: filteredTokenBalances,
    description: 'multi-amb-erc20-to-erc677'
  }).save()
  // console.log(filteredTokenBalances)
  // console.log(tokenPrices)
  // console.log((await fetchBridgedTokenPairs()).map(({ foreignAddress, symbol }) => ({ foreignAddress, symbol, balance: filteredTokenBalances[foreignAddress], price: tokenPrices[foreignAddress] })))
  console.log(`tvl for ${accountAddress} is ${tvl.div(new BigNumber(10).pow(18))} USD`)
}

const calculateTvl = async () => {
  const foreignNetwork = createNetwork('foreign')
  const accountList = ['0xf301d525da003e874DF574BCdd309a6BF0535bb6']
  for (const accountAddress of accountList) {
    calculateAccountTvl(accountAddress, foreignNetwork)
  }
}

calculateTvl()

module.exports = {
  fetchTokenBalances,
  fetchTokenPricesInUSD,
  calculateAccountTvl
}
