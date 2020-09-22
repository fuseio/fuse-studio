const { inspect } = require('util')
const BigNumber = require('bignumber.js')
const foreign = require('@services/web3/foreign')
const BasicTokenAbi = require('@fuse/token-factory-contracts/abi/BasicToken')

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

const fetchBalance = async ({ createContract }, tokenAddress, accountAddress) => {
  const tokenContract = createContract(BasicTokenAbi, tokenAddress)
  const accountBalance = await tokenContract.methods.balanceOf(accountAddress).call()
  console.log(`balance of account ${accountAddress} of token ${tokenAddress} is ${accountBalance}`)
  return accountBalance
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

const approve = async (network, { from, to, tokenAddress, amount }) => {
  const { createContract, createMethod, send } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const method = createMethod(tokenContract, 'approve', to, amount)

  const receipt = await send(method, {
    from
  })
  return receipt
}

const hasAllowance = async (network, { to, tokenAddress, amount }) => {
  const { createContract } = network

  const tokenContract = createContract(BasicTokenAbi, tokenAddress)

  const allowance = await tokenContract.methods.allowance(to).call()
  return new BigNumber(allowance).isGreaterThanOrEqualTo(amount.toString())
}

module.exports = {
  fetchTokenData,
  fetchBalance,
  transfer,
  approve,
  hasAllowance
}
