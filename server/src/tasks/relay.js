const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork /* signRelay, getNonceForRelay */ } = require('@utils/web3')
const CommunityManager = require(`@constants/abi/CommunityManager`)
const homeAddresses = config.get('network.home.addresses')

const relay = withAccount(async (account, { walletAddress, methodData, nonce, gasPrice, gasLimit, signature }) => {
  const { web3, createContract, createMethod, send } = createNetwork('home', account)
  const contract = createContract(CommunityManager, homeAddresses.walletModules.CommunityManager)
  // const join = createMethod(contract, 'joinCommunity', walletAddress, communityAddress)
  // const methodData = join.encodeABI()
  // console.log({ methodData })
  // const nonce = await getNonceForRelay(web3)
  // console.log({ nonce })
  // const signature = await signRelay(web3, homeAddresses.walletModules.CommunityManager, walletAddress, 0, methodData, nonce, gasPrice, gasLimit)
  // console.log({ signature })
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)
  const receipt = await send(method, {
    from: account.address
  })
  return receipt
})

module.exports = {
  relay
}
