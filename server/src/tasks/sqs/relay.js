const config = require('config')
const lodash = require('lodash')
const { createNetwork } = require('@utils/web3')
const { fetchTokenByCommunity } = require('@utils/graph')
const { getParamsFromMethodData } = require('@utils/abi')
const request = require('request-promise-native')
const mongoose = require('mongoose')
const { notifyReceiver } = require('@services/firebase')
const web3Utils = require('web3-utils')
const UserWallet = mongoose.model('UserWallet')
const Community = mongoose.model('Community')
const { deduceTransactionBodyForFundToken } = require('@utils/wallet/misc')

const isAllowedToRelayForeign = (web3, walletModule, walletModuleABI, methodName, methodData) => {
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

const isAllowedToRelayHome = (web3, walletModule, walletModuleABI, methodName, methodData) => {
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

const isAllowedToRelay = (web3, walletModule, walletModuleABI, methodName, methodData, networkType) => {
  console.log(`[isAllowedToRelay] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}, networkType: ${networkType}`)
  return networkType === 'foreign'
    ? isAllowedToRelayForeign(web3, walletModule, walletModuleABI, methodName, methodData)
    : isAllowedToRelayHome(web3, walletModule, walletModuleABI, methodName, methodData)
}

const relay = async (account, { walletAddress, communityAddress, methodName, methodData, nonce, gasPrice, gasLimit, signature, walletModule, network, identifier, appName, nextRelays, isFunderDeprecated }, job) => {
  const networkType = network === config.get('network.foreign.name') ? 'foreign' : 'home'
  const { web3, createContract, createMethod, send } = createNetwork(networkType, account)
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  console.log(`before isAllowedToRelay`)
  const allowedToRelay = isAllowedToRelay(web3, walletModule, walletModuleABI, methodName, methodData, networkType)
  console.log(`isAllowedToRelay: ${allowedToRelay}`)
  if (allowedToRelay) {
    const userWallet = await UserWallet.findOne({ walletAddress })
    const contract = createContract(walletModuleABI, userWallet.walletModules[walletModule])
    const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)

    const receipt = await send(method, {
      from: account.address,
      gas: config.get('gasLimitForTx.createForeignWallet')
    }, {
      job
    })

    const txSuccess = lodash.get(receipt, 'status')
    const relayingSuccess = txSuccess && lodash.get(receipt, 'events.TransactionExecuted.returnValues.success')

    if (relayingSuccess) {
      const returnValues = lodash.get(receipt, 'events.TransactionExecuted.returnValues')
      const { wallet, signedHash } = returnValues
      console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)

      if (walletModule === 'CommunityManager') {
        try {
          const { _community: communityAddress } = getParamsFromMethodData(walletModuleABI, 'joinCommunity', methodData)
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

          const community = await Community.findOne({ communityAddress })
          const hasBonus = lodash.get(community, `plugins.joinBonus.isActive`, false) && lodash.get(community, `plugins.joinBonus.joinInfo.amount`, false)
          if (hasBonus) {
            if (isFunderDeprecated) {
              const taskManager = require('@services/taskManager')
              const bonusType = 'join'
              const bonusAmount = lodash.get(community, `plugins.${bonusType}Bonus.${bonusType}Info.amount`)
              const bonusMaxTimesLimit = lodash.get(community, `${bonusType}.maxTimes`, 100)
              const jobData = { phoneNumber, receiverAddress: walletAddress, identifier, tokenAddress, communityAddress, bonusType, bonusAmount, bonusMaxTimesLimit }
              const { plugins } = community
              const transactionBody = await deduceTransactionBodyForFundToken(plugins, jobData)
              const funderJob = await taskManager.now('fundToken', { ...jobData, transactionBody }, { isWalletJob: true })
              job.set('data.funderJobId', funderJob._id)
              job.save()
            } else {
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
            }
          }
        } catch (e) {
          console.log(`Error on token funding for wallet: ${wallet}`, e)
        }
      } else if (walletModule === 'TransferManager' && methodName === 'transferToken') {
        const { _to, _amount, _token } = getParamsFromMethodData(walletModuleABI, 'transferToken', methodData)
        notifyReceiver({
          receiverAddress: _to,
          tokenAddress: _token,
          amountInWei: _amount,
          communityAddress
        })
          .catch(console.error)
      }

      if (nextRelays && nextRelays.length > 0) {
        const taskManager = require('@services/taskManager')
        const nextToRelay = nextRelays.shift()
        const nextRelayJob = await taskManager.now('relay', { ...nextToRelay, identifier, appName, nextRelays })
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
