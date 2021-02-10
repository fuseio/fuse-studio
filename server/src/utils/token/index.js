const config = require('config')
const { inspect } = require('util')
const request = require('request-promise-native')
const foreign = require('@services/web3/foreign')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')
const { toWei } = require('web3-utils')
const { uniswapClient } = require('@services/graph')
const BigNumber = require('bignumber.js')

const fetchToken = async (tokenAddress) => {
  const res = await request.get(`${config.get('explorer.fuse.urlBase')}?module=token&action=getToken&contractaddress=${tokenAddress}`)
  const data = JSON.parse(res)
  return data['result']
}

const fetchTokenData = async (address, fields = {}, web3 = foreign.web3) => {
  const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
  const [name, symbol, totalSupply, decimals, tokenURI] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call(),
    tokenContractInstance.methods.decimals().call(),
    fields.tokenURI ? tokenContractInstance.methods.tokenURI().call() : undefined
  ])

  const fetchedTokedData = { name, symbol, totalSupply: totalSupply.toString(), decimals, tokenURI }

  console.log(`Fetched token ${address} data: ${inspect(fetchedTokedData)}`)
  return fetchedTokedData
}

const adjustDecimals = (amount, currentDecimals, desiredDecimals) => {
  return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(desiredDecimals - currentDecimals)).toFixed()
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

const transfer = async (network, { from, to, tokenAddress, amount }) => {
  const { createContract, createMethod, send } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const method = createMethod(tokenContract, 'transfer', to, amount)

  const receipt = await send(method, {
    from
  })
  return receipt
}

const approve = async (network, { from, tokenAddress, spender, amount, infinite }) => {
  const { createContract, createMethod, send } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const method = createMethod(tokenContract, 'approve', spender, infinite ? toWei('1000000000') : amount)

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

const stableCoins = [
  config.get('network.foreign.addresses.USDCoin'),
  config.get('network.foreign.addresses.DaiStablecoin'),
  config.get('network.foreign.addresses.TetherUSD')
]

const isStableCoin = (tokenAddress) => stableCoins.includes(tokenAddress)

module.exports = {
  fetchTokenData,
  fetchBalance,
  fetchTokenPrice,
  transfer,
  approve,
  getAllowance,
  fetchToken,
  isStableCoin,
  adjustDecimals
}
