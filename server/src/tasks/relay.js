const config = require('config')
const lodash = require('lodash')
const { withAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { GraphQLClient } = require('graphql-request')
const request = require('request-promise-native')
const mongoose = require('mongoose')
const { getAdmin } = require('@services/firebase')
const web3Utils = require('web3-utils')

const graphClient = new GraphQLClient(config.get('graph.url'))
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

const notifyReceiver = async ({ receiverAddress, tokenAddress, amountInWei, appName }) => {
  const receiverWallet = await UserWallet.findOne({ walletAddress: receiverAddress })
  const firebaseToken = lodash.get(receiverWallet, 'firebaseToken')
  if (firebaseToken) {
    const { symbol } = await fetchToken(tokenAddress)
    const amount = web3Utils.fromWei(String(amountInWei))
    const message = {
      notification: {
        title: `You got ${amount} ${symbol}`,
        body: 'Please click on this message to open your Fuse wallet'
      },
      token: firebaseToken
    }
    console.log(`Sending tokens receive push message to ${receiverWallet.phoneNumber} via firebase token ${firebaseToken}`)
    getAdmin(appName).messaging().send(message)
  } else {
    console.warn(`No firebase token found for ${receiverAddress} wallet address`)
  }
}

const relay = withAccount(async (account, { walletAddress, methodData, nonce, gasPrice, gasLimit, signature, walletModule, identifier, appName }, job) => {
  const { web3, createContract, createMethod, send } = createNetwork('home', account)
  const walletABI = require(`@constants/abi/${walletModule}`)
  const userWallet = await UserWallet.findOne({ walletAddress })
  const contract = createContract(walletABI, userWallet.walletModules[walletModule])
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)

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
        const { phoneNumber } = await UserWallet.findOne({ walletAddress })
        request.post(`${config.get('funder.urlBase')}fund/token`, {
          json: true,
          body: { phoneNumber, accountAddress: walletAddress, identifier, tokenAddress, originNetwork }
        }, (err, response, body) => {
          if (err) {
            console.error(`Error on token funding for wallet: ${wallet}`, err)
            job.fail(err)
          } else if (body.error) {
            console.error(`Error on token funding for wallet: ${wallet}`, body.error)
            job.fail(body.error)
          } else {
            job.attrs.data.funderJobId = body.job._id
          }
          job.save()
        })
      } catch (e) {
        console.log(`Error on token funding for wallet: ${wallet}`, e)
      }
    } else if (walletModule === 'TransferManager') {
      const { _to, _amount, _token, _wallet } = getParamsFromMethodData(web3, walletABI, 'transferToken', methodData)
      notifyReceiver({ senderAddress: _wallet, receiverAddress: _to, tokenAddress: _token, amountInWei: _amount, appName })
        .catch(console.error)
    }
  } else {
    console.error(`Relay transaction failed from wallet: ${wallet}, signedHash: ${signedHash}`)
  }
  return receipt
})

module.exports = {
  relay
}
