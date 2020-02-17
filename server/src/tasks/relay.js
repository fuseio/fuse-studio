const config = require('config')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { GraphQLClient } = require('graphql-request')
const request = require('request-promise-native')
const mongoose = require('mongoose')
const { admin } = require('@services/firebase')
const web3Utils = require('web3-utils')

const graphClient = new GraphQLClient(config.get('graph.url'))
const homeAddresses = config.get('network.home.addresses')
const UserWallet = mongoose.model('UserWallet')

function getParamsFromMethodData (web3, abi, methodName, methodData) {
  const methodABI = abi.filter(obj => obj.name === methodName)[0]
  const methodSig = web3.eth.abi.encodeFunctionSignature(methodABI)
  const params = web3.eth.abi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  return params
}

const fetchTokenByCommunity = async (communityAddress) => {
  const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
  const { tokens } = await graphClient.request(query)
  return tokens[0]
}

const fetchToken = async (tokenAddress) => {
  const query = `{token(id: "${tokenAddress.toLowerCase()}") {symbol, name}}`
  const { token } = await graphClient.request(query)
  return token
}

const relay = withAccount(async (account, { walletAddress, methodData, nonce, gasPrice, gasLimit, signature, walletModule }, job) => {
  const { web3, createContract, createMethod, send } = createNetwork('home', account)
  const walletABI = require(`@constants/abi/${walletModule}`)
  const contract = createContract(walletABI, homeAddresses.walletModules[walletModule])
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)

  const { _to, _amount, _token } = getParamsFromMethodData(web3, walletABI, 'transferToken', methodData)
  const results = await UserWallet.find({ walletAddress: _to }, null, { sort: { createdAt: -1 }, limit: 1 })
  const firebaseToken = results[0] ? results[0].firebaseToken : null
  if (firebaseToken) {
    const { symbol } = await fetchToken(_token)
    const amount = web3Utils.fromWei(String(_amount))
    const message = {
      notification: {
        title: `Send you ${amount} ${symbol}`,
        body: 'Please click on this message to open your Fuse wallet'
      },
      token: firebaseToken
    }
    console.log({ message })
    admin.messaging().send(message)
  }

  const receipt = await send(method, {
    from: account.address,
    gas: 5000000
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })


  const { success, wallet, signedHash } = receipt.events.TransactionExecuted.returnValues
  if (success) {
    console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)
    if (walletModule === 'CommunityManager') {
      try {
        console.log(`Requesting token funding for wallet: ${wallet}`)
        const params = getParamsFromMethodData(web3, walletABI, 'joinCommunity', methodData)
        const token = await fetchTokenByCommunity(params._community)
        const tokenAddress = web3.utils.toChecksumAddress(token.address)
        const { originNetwork } = token
        request.post(`${config.get('funder.urlBase')}fund/token`, {
          json: true,
          body: { accountAddress: walletAddress, tokenAddress, originNetwork }
        })
      } catch (e) {
        console.log(`Error on token funding for wallet: ${wallet}`, e)
      }
    } else if (walletModule === 'TransferManager') {
      const { _to } = getParamsFromMethodData(web3, walletABI, 'transferToken', methodData)
      const results = UserWallet.find({ walletAddress: _to }, { sort: { createdAt: -1 }, limit: 1 })
      const firebaseToken = results[0] ? results[0].firebaseToken : null
      if (firebaseToken) {
        // const userWallet = results[0]
        const message = {
          notification: {
            title: 'You got tokens',
            body: 'Got tokens'
          },
          token: firebaseToken
        }
        admin.messaging().send(message)
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
