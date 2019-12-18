const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const homeAddresses = config.get('network.home.addresses')
const { GraphQLClient } = require('graphql-request')
const graphClient = new GraphQLClient(config.get('graph.url'))
const request = require('request-promise-native')

function getParamsFromMethodData (web3, abi, methodName, methodData) {
  const methodABI = abi.filter(obj => obj.name === methodName)[0]
  // console.log({ methodABI })
  const methodSig = web3.eth.abi.encodeFunctionSignature(methodABI)
  // console.log({ methodSig })
  // console.log({ inputs: methodABI.inputs })
  const params = web3.eth.abi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  // console.log({ params })
  return params
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
  // console.log({ methodData })
  const { success, wallet, signedHash } = receipt.events.TransactionExecuted.returnValues
  // console.log({ success, wallet, signedHash })
  if (success) {
    console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)
    if (walletModule === 'CommunityManager') {
      try {
        console.log(`Requesting token funding for wallet: ${wallet}`)
        const params = getParamsFromMethodData(web3, ABI, 'joinCommunity', methodData)
        const query = `{tokens(where: {communityAddress: "${params._community}"}) {address, communityAddress, originNetwork}}`
        // console.log({ query })
        const { tokens } = await graphClient.request(query)
        // console.log({ tokens })
        const tokenAddress = web3.utils.toChecksumAddress(tokens[0].address)
        const originNetwork = tokens[0].originNetwork
        request.post(`${config.get('funder.urlBase')}fund/token`, {
          json: true,
          body: { accountAddress: walletAddress, tokenAddress, originNetwork }
        })
      } catch (e) {
        console.log(`Error on token funding for wallet: ${wallet}`, e)
      }
    }
  } else {
    console.error(`Relay transaction failed from wallet: ${wallet}, signedHash: ${signedHash}`)
  }
  return receipt
})

module.exports = {
  relay
}
