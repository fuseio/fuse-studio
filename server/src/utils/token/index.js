const config = require('config')
const { inspect } = require('util')
const request = require('request-promise-native')
const foreign = require('@services/web3/foreign')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const web3Utils = require('web3-utils')
const { uniswapClient } = require('@services/graph')
const BigNumber = require('bignumber.js')
const { id } = require('@ethersproject/hash')
const { AddressZero } = require('ethers/constants')
const ERC20_TRANSFER_EVENT = 'Transfer(address,address,uint256)'
const ERC20_TRANSFER_EVENT_HASH = id(ERC20_TRANSFER_EVENT)

const fetchToken = async (tokenAddress) => {
  if (isNative(tokenAddress)) {
    return config.get('network.home.native')
  }
  const res = await request.get(`${config.get('explorer.fuse.urlBase')}?module=token&action=getToken&contractaddress=${tokenAddress}`)
  const data = JSON.parse(res)
  return data['result']
}

const fetchTokenData = async (address, fields = {}, web3 = foreign.web3) => {
  if (isNative(address)) {
    return config.get('network.home.native')
  }
  const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
  const [name, symbol, totalSupply, decimals] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call(),
    tokenContractInstance.methods.decimals().call()
  ])

  const fetchedTokedData = { name, symbol, totalSupply: totalSupply.toString(), decimals }

  console.log(`Fetched token ${address} data: ${inspect(fetchedTokedData)}`)
  return fetchedTokedData
}

const fetchNftData = async (address, fields = {}, web3 = foreign.web3) => {
  if (isNative(address)) {
    return config.get('network.home.native')
  }
  const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
  const [name, symbol, totalSupply] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call()
  ])

  const fetchedTokedData = { name, symbol, totalSupply: totalSupply.toString() }

  console.log(`Fetched token ${address} data: ${inspect(fetchedTokedData)}`)
  return fetchedTokedData
}

const isNative = (tokenAddress) => tokenAddress === AddressZero

const adjustDecimals = (amount, currentDecimals, desiredDecimals) => {
  return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(desiredDecimals - currentDecimals)).toFixed()
}

const toWei = (amount, tokenDecimals = 18) => {
  return new BigNumber(String(amount)).multipliedBy(new BigNumber(10).pow(tokenDecimals)).toFixed()
}

const fetchBalance = async ({ createContract }, tokenAddress, accountAddress) => {
  const tokenContract = createContract(BasicTokenAbi, tokenAddress)
  const accountBalance = await tokenContract.methods.balanceOf(accountAddress).call()
  return accountBalance
}

const fetchTokenPrice = async (tokenAddress) => {
  const query = `{tokenDayDatas(where: {token: "${tokenAddress}"}, orderDirection: desc, orderBy: date, first: 1) {id, date, priceUSD}}`
  const { tokenDayDatas } = await uniswapClient.request(query)
  return tokenDayDatas.length > 0 ? tokenDayDatas[0] : {}
}

const transfer = async (network, { from, to, tokenAddress, amount }, options) => {
  const { createContract, createMethod, send } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const method = createMethod(tokenContract, 'transfer', to, amount)

  const receipt = await send(method, { from }, options)
  return receipt
}

const approve = async (network, { from, tokenAddress, spender, amount, infinite }) => {
  const { createContract, createMethod, send } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const method = createMethod(tokenContract, 'approve', spender, infinite ? web3Utils.toWei('1000000000') : amount)

  const receipt = await send(method, {
    from
  })
  return receipt
}

const getAllowance = async (network, { tokenAddress, owner, spender }) => {
  const { createContract } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const allowance = await tokenContract.methods.allowance(owner, spender).call()
  return allowance
}

const stableCoins = {
  ethereum: [
    config.get('network.foreign.addresses.USDCoin'),
    config.get('network.foreign.addresses.DaiStablecoin'),
    config.get('network.foreign.addresses.TetherUSD'),
    ...(config.has('network.foreign.extraStableCoins') ? config.get('network.foreign.extraStableCoins') : [])
  ],
  bsc: [
    config.get('network.bsc.addresses.BUSD')
  ],
  fuse: [
    config.get('network.home.addresses.FuseDollar')
  ]
}

const isStableCoin = (tokenAddress, network = 'ethereum') => stableCoins[network].map(tokenAddress => tokenAddress.toLowerCase())
  .includes(tokenAddress.toLowerCase())

module.exports = {
  fetchTokenData,
  fetchNftData,
  fetchBalance,
  fetchTokenPrice,
  transfer,
  approve,
  getAllowance,
  fetchToken,
  isStableCoin,
  adjustDecimals,
  toWei,
  ERC20_TRANSFER_EVENT_HASH
}
