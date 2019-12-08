const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const CommunityManager = require(`@constants/abi/CommunityManager`)
const homeAddresses = config.get('network.home.addresses')

const relay = withAccount(async (account, { walletAddress, methodData, nonce, gasPrice, gasLimit, signature }) => {
  const { web3, createContract, createMethod, send } = createNetwork('home', account)
  const contract = createContract(CommunityManager, homeAddresses.walletModules.CommunityManager)
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)
  const receipt = await send(method, {
    from: account.address
  })
  return receipt
})

module.exports = {
  relay
}
