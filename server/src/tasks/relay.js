const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const homeAddresses = config.get('network.home.addresses')

const relay = withAccount(async (account, { walletAddress, methodData, nonce, gasPrice, gasLimit, signature, walletModule }) => {
  const { createContract, createMethod, send } = createNetwork('home', account)
  const ABI = require(`@constants/abi/${walletModule}`)
  const contract = createContract(ABI, homeAddresses.walletModules[walletModule])
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)
  const receipt = await send(method, {
    from: account.address
  })
  return receipt
})

module.exports = {
  relay
}
