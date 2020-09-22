const HomeMultiAMBErc20ToErc677 = require('@constants/abi/HomeMultiAMBErc20ToErc677')

const relayTokens = async (network, { from, tokenAddress, amount, customerAddress }) => {
  const { createContract, createMethod, send } = network

  const tokenContract = createContract(HomeMultiAMBErc20ToErc677, tokenAddress)

  const method = createMethod(tokenContract, 'relayTokens', tokenAddress, customerAddress, amount)

  const receipt = await send(method, {
    from
  })
  return receipt
}

module.exports = {
  relayTokens
}
