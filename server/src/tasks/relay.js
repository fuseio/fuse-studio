const config = require('config')
const lodash = require('lodash')
const { withWalletAccount } = require('@utils/account')
const { createNetwork } = require('@utils/web3')
const { fetchTokenByCommunity } = require('@utils/graph')
const { GraphQLClient } = require('graphql-request')
const request = require('request-promise-native')
const mongoose = require('mongoose')
const { getAdmin } = require('@services/firebase')
const web3Utils = require('web3-utils')
const UserWallet = mongoose.model('UserWallet')

const graphClient = new GraphQLClient(`${config.get('graph.url')}${config.get('graph.subgraphs.fuse')}`)

function getParamsFromMethodData (web3, abi, methodName, methodData) {
  const methodABI = abi.filter(obj => obj.name === methodName)[0]
  const methodSig = web3.eth.abi.encodeFunctionSignature(methodABI)
  const params = web3.eth.abi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  return params
}

const fetchCommunityAddressByTokenAddress = async (tokenAddress) => {
  const query = `{tokens(where: {address: "${tokenAddress}"}) {communityAddress}}`
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
    if (!appName) {
      try {
        const { communityAddress } = await fetchCommunityAddressByTokenAddress(tokenAddress)
        message.data = {
          communityAddress,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      } catch (error) {
        console.log(`Error while fetching community address for ${tokenAddress} from the graph ${error}`)
      }
    }
    console.log(`Sending tokens receive push message to ${receiverWallet.phoneNumber} via firebase token ${firebaseToken}`)
    getAdmin(appName).messaging().send(message)
  } else {
    console.warn(`No firebase token found for ${receiverAddress} wallet address`)
  }
}

const isAllowedToRelayForeign = async (web3, walletModule, walletModuleABI, methodName, methodData) => {
  const allowedModules = ['TransferManager', 'DAIPointsManager']
  console.log(`[isAllowedToRelayForeign] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}`)
  let isAllowed = true
  if (!allowedModules.includes(walletModule)) {
    console.log(`[isAllowedToRelayForeign] FALSE`)
    isAllowed = false
  }
  // TODO add more validations
  console.log(`[isAllowedToRelayForeign] RETURN ${isAllowed}`)
  return isAllowed
}

const isAllowedToRelayHome = async (web3, walletModule, walletModuleABI, methodName, methodData) => {
  const allowedModules = ['TransferManager', 'CommunityManager']
  console.log(`[isAllowedToRelayHome] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}`)
  let isAllowed = true
  if (!allowedModules.includes(walletModule)) {
    console.log(`[isAllowedToRelayHome] FALSE`)
    isAllowed = false
  }
  // TODO add more validations
  console.log(`[isAllowedToRelayHome] RETURN ${isAllowed}`)
  return isAllowed
}

const isAllowedToRelay = async (web3, walletModule, walletModuleABI, methodName, methodData, networkType) => {
  console.log(`[isAllowedToRelay] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}, networkType: ${networkType}`)
  return networkType === 'foreign'
    ? isAllowedToRelayForeign(web3, walletModule, walletModuleABI, methodName, methodData)
    : isAllowedToRelayHome(web3, walletModule, walletModuleABI, methodName, methodData)
}

const relay = withWalletAccount(async (account, { walletAddress, methodName, methodData, nonce, gasPrice, gasLimit, signature, walletModule, network, identifier, appName, nextRelays }, job) => {
  const networkType = network === config.get('network.foreign.name') ? 'foreign' : 'home'
  const { web3, createContract, createMethod, send } = createNetwork(networkType, account)
  const walletModuleABI = require(`@constants/abi/${walletModule}`)

  console.log(`before isAllowedToRelay`)
  const allowedToRelay = await isAllowedToRelay(web3, walletModule, walletModuleABI, methodName, methodData, networkType)
  console.log(`isAllowedToRelay: ${allowedToRelay}`)
  if (allowedToRelay) {
    const userWallet = await UserWallet.findOne({ walletAddress })
    const contract = createContract(walletModuleABI, userWallet.walletModules[walletModule])
    const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)

    const receipt = await send(method, {
      from: account.address,
      gas: config.get('gasLimitForTx.createForeignWallet')
    }, {
      transactionHash: (hash) => {
        job.attrs.data.txHash = hash
        job.save()
      }
    })

    const returnValues = receipt && receipt.events.TransactionExecuted.returnValues
    if (!returnValues) {
      job.attrs.data.transactionBody = { ...lodash.get(job.attrs.data, 'transactionBody', {}), status: 'failed' }
      job.save()
      throw new Error(`No return values in receipt (or now receipt)`)
    }
    const { success, wallet, signedHash } = returnValues
    const { blockNumber } = receipt
    if (success) {
      job.attrs.data.transactionBody = { ...lodash.get(job.attrs.data, 'transactionBody', {}), status: 'confirmed', blockNumber }
      job.save()
      console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)
      if (walletModule === 'CommunityManager') {
        try {
          const { _community } = getParamsFromMethodData(web3, walletModuleABI, 'joinCommunity', methodData)
          console.log(`Requesting token funding for wallet: ${wallet} and community ${_community}`)
          let tokenAddress, originNetwork
          if (lodash.get(job.attrs.data.transactionBody, 'tokenAddress', false) && lodash.get(job.attrs.data.transactionBody, 'originNetwork', false)) {
            tokenAddress = web3Utils.toChecksumAddress(lodash.get(job.attrs.data.transactionBody, 'tokenAddress'))
            originNetwork = lodash.get(job.attrs.data.transactionBody, 'originNetwork')
          } else {
            const token = await fetchTokenByCommunity(_community)
            tokenAddress = web3Utils.toChecksumAddress(token.address)
            originNetwork = token.originNetwork
          }
          const { phoneNumber } = await UserWallet.findOne({ walletAddress })
          request.post(`${config.get('funder.urlBase')}fund/token`, {
            json: true,
            body: { phoneNumber, accountAddress: walletAddress, identifier, tokenAddress, originNetwork }
          }, (err, response, body) => {
            if (err) {
              console.error(`Error on token funding for wallet: ${wallet}`, err)
            } else if (body.error) {
              console.error(`Error on token funding for wallet: ${wallet}`, body.error)
            } else if (lodash.has(body, 'job._id')) {
              job.attrs.data.funderJobId = body.job._id
            }
            job.save()
          })
        } catch (e) {
          console.log(`Error on token funding for wallet: ${wallet}`, e)
        }
      } else if (walletModule === 'TransferManager' && methodName === 'transferToken') {
        const { _to, _amount, _token, _wallet } = getParamsFromMethodData(web3, walletModuleABI, 'transferToken', methodData)
        notifyReceiver({ senderAddress: _wallet, receiverAddress: _to, tokenAddress: _token, amountInWei: _amount, appName })
          .catch(console.error)
      }

      if (nextRelays && nextRelays.length > 0) {
        const { agenda } = require('@services/agenda')
        const nextToRelay = nextRelays.shift()
        const nextRelayJob = await agenda.now('relay', { ...nextToRelay, identifier, appName, nextRelays })
        job.attrs.data.nextRealyJobId = nextRelayJob.attrs._id.toString()
        job.save()
      }
    } else {
      job.attrs.data.transactionBody = { ...lodash.get(job.attrs.data, 'transactionBody', {}), status: 'failed', blockNumber }
      job.save()
      console.error(`Relay transaction failed from wallet: ${wallet}, signedHash: ${signedHash}`)
    }
    return receipt
  } else {
    job.fail(`Not allowed to relay`)
  }
})

module.exports = {
  relay
}
