const web3 = require('@services/web3')
const basicTokenAbi = require('@constants/abi/BasicToken')
const mongoose = require('mongoose')

const token = mongoose.token

const fetchTokenData = async (address) => {
  const tokenContractInstance = new web3.eth.Contract(basicTokenAbi, address)
  const [name, symbol, totalSupply, tokenURI] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call(),
    tokenContractInstance.methods.tokenURI().call()
  ])

  return {address, name, symbol, totalSupply, tokenURI}
}

const createToken = async (data) => {
  return token.create(data)
}

module.exports = {
  fetchTokenData,
  createToken
}
