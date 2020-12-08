const config = require('config')
const lodash = require('lodash')
const { createNetwork } = require('@utils/web3')
const { fetchTokenByCommunity } = require('@utils/graph')
const request = require('request-promise-native')
const mongoose = require('mongoose')
const { notifyReceiver } = require('@services/firebase')
const web3Utils = require('web3-utils')
const UserWallet = mongoose.model('UserWallet')

const getParamsFromMethodData = (web3, abi, methodName, methodData) => {
  const methodABI = abi.filter(obj => obj.name === methodName)[0]
  const methodSig = web3.eth.abi.encodeFunctionSignature(methodABI)
  const params = web3.eth.abi.decodeParameters(methodABI.inputs, `0x${methodData.replace(methodSig, '')}`)
  return params
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

const relay = async (account, { walletAddress, methodName, methodData, nonce, gasPrice, gasLimit, signature, walletModule, network, identifier, appName, nextRelays }, job) => {
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
        job.set('data.txHash', hash)
        job.save()
      }
    })

    const success = lodash.get(receipt, 'status') && lodash.get(receipt, 'events.TransactionExecuted.returnValues.success')
    if (success) {
      const returnValues = lodash.get(receipt, 'events.TransactionExecuted.returnValues')
      const { wallet, signedHash } = returnValues
      const { blockNumber } = receipt
      job.set('data.transactionBody', { ...lodash.get(job.data, 'transactionBody', {}), status: 'confirmed', blockNumber })
      job.save()
      console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)
      if (walletModule === 'CommunityManager') {
        try {
          const { _community: communityAddress } = getParamsFromMethodData(web3, walletModuleABI, 'joinCommunity', methodData)
          console.log(`Requesting token funding for wallet: ${wallet} and community ${communityAddress}`)
          let tokenAddress, originNetwork
          if (lodash.get(job.data.transactionBody, 'tokenAddress', false) && lodash.get(job.data.transactionBody, 'originNetwork', false)) {
            tokenAddress = web3Utils.toChecksumAddress(lodash.get(job.data.transactionBody, 'tokenAddress'))
            originNetwork = lodash.get(job.data.transactionBody, 'originNetwork')
          } else {
            const token = await fetchTokenByCommunity(communityAddress)
            tokenAddress = web3Utils.toChecksumAddress(token.address)
            originNetwork = token.originNetwork
          }
          const { phoneNumber } = await UserWallet.findOne({ walletAddress })
          request.post(`${config.get('funder.urlBase')}fund/token`, {
            json: true,
            body: { phoneNumber, accountAddress: walletAddress, identifier, tokenAddress, originNetwork, communityAddress }
          }, (err, response, body) => {
            if (err) {
              console.error(`Error on token funding for wallet: ${wallet}`, err)
            } else if (body.error) {
              console.error(`Error on token funding for wallet: ${wallet}`, body.error)
            } else if (lodash.has(body, 'job._id')) {
              job.set('data.funderJobId', body.job._id)
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
        job.set('data.nextRealyJobId', nextRelayJob._id.toString())
        job.save()
      }
    } else {
      job.set('data.transactionBody', { ...lodash.get(job.data, 'transactionBody', {}), status: 'failed', blockNumber: lodash.get(receipt, 'blockNumber') })
      job.save()
      console.error(`Relay transaction failed from wallet: ${lodash.get(receipt, 'events.TransactionExecuted.returnValues.wallet')}, signedHash: ${lodash.get(receipt, 'events.TransactionExecuted.returnValues.signedHash')}`)
    }
    return receipt
  }
}

module.exports = {
  relay
}
