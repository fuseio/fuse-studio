const HomeMultiAMBErc20ToErc677 = require('@constants/abi/HomeMultiAMBErc20ToErc677')

const relayTokens = async (network, { from, bridgeAddress, tokenAddress, receiver, amount, gasSpeed }) => {
  const { createContract, createMethod, send } = network

  const multiBridgeContract = createContract(HomeMultiAMBErc20ToErc677, bridgeAddress)

  const method = createMethod(multiBridgeContract, 'relayTokens', tokenAddress, receiver, amount)

  const receipt = await send(method, {
    from,
    gasSpeed
  })
  return receipt
}

module.exports = {
  relayTokens
}
