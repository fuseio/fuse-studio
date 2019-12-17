const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const homeAddresses = config.get('network.home.addresses')
// const request = require('request-promise-native')

function getSigFromMethodData () {

}

function getMethodBySig () {

}

const relay = withAccount(async (account, { walletAddress, methodData, nonce, gasPrice, gasLimit, signature, walletModule }, job) => {
  const { web3, createContract, createMethod, send } = createNetwork('home', account)
  const ABI = require(`@constants/abi/${walletModule}`)
  const contract = createContract(ABI, homeAddresses.walletModules[walletModule])
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)
  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
  console.log({ methodData })
  const { success, wallet, signedHash } = receipt.events.TransactionExecuted.returnValues
  if (success) {
    console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)
    if (walletModule === 'CommunityManager') {
      console.log(`Requesting token funding for walltet $wallet`)
      const sig = getSigFromMethodData(methodData)
      const methodAbi = getMethodBySig(ABI, sig)
      const parsedArguments = web3.eth.abi.decodeParameters(methodAbi.inputs)
      const communityAddress = parsedArguments._community
      console.log({ communityAddress })
      // request.post(`${config.get('funder.urlBase')}fund/token`, {
      //   json: true,
      //   body: { accountAddress: walletAddress, tokenAddress, networkType: config.get('network.foreign.name') }
      // })
    }
  } else {
    console.error(`Relay transaction failed from wallet: ${wallet}, signedHash: ${signedHash}`)
  }
  return receipt
})

module.exports = {
  relay
}
