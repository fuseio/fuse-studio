const web3 = require('@services/web3')
const basicTokenAbi = require('@constants/abi/BasicToken')

const fetchTokenData = async (address) => {
  const tokenContractInstance = new web3.eth.Contract(basicTokenAbi, address)
  const [name, symbol, totalSupply, tokenURI] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call(),
    tokenContractInstance.methods.tokenURI().call()
  ])

  return {name, symbol, totalSupply, tokenURI}
}

module.exports = {
  fetchTokenData
}
