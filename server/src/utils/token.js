const givenWeb3 = require('@services/web3')
const { web3, from, send } = require('@services/web3/home')
const BasicTokenAbi = require('@fuse/token-factory-contracts/build/abi/BasicToken')

const fetchTokenData = async (address) => {
  const tokenContractInstance = new givenWeb3.eth.Contract(BasicTokenAbi, address)
  const [name, symbol, totalSupply, tokenURI] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call(),
    tokenContractInstance.methods.tokenURI().call()
  ])

  return { name, symbol, totalSupply, tokenURI }
}

const transferOwnhership = async (token) => {
  const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, token.address)

  const method = tokenContractInstance.methods.transferOwnhership(token.owner)

  return send(method, {
    from
  })
}

module.exports = {
  fetchTokenData,
  transferOwnhership
}
