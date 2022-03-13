const config = require('config')
const lodash = require('lodash')
const { createNetwork } = require('@utils/web3')
const { fetchTokenByCommunity } = require('@utils/graph')
const { getParamsFromMethodData } = require('@utils/abi')
const mongoose = require('mongoose')
const { notifyReceiver } = require('@services/firebase')
const { sendRelay, isAllowedToRelay } = require('@utils/relay')
const { toChecksumAddress } = require('web3-utils')
const UserWallet = mongoose.model('UserWallet')
const Community = mongoose.model('Community')
const { deduceTransactionBodyForFundToken } = require('@utils/wallet/misc')

const relay = async (account, { walletAddress, communityAddress, methodName, methodData, nonce, gasPrice, gasLimit, signature, walletModule, network, identifier, appName, nextRelays }, job) => {
  const networkType = network === config.get('network.foreign.name') ? 'foreign' : 'home'
  const { web3 } = createNetwork(networkType, account)
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  console.log(`before isAllowedToRelay`)
  const allowedToRelay = isAllowedToRelay(web3, walletModule, walletModuleABI, methodName, methodData, networkType)
  console.log(`isAllowedToRelay: ${allowedToRelay}`)
  if (allowedToRelay) {
    const userWallet = await UserWallet.findOne({ walletAddress })
    const walletModuleAddress = userWallet.walletModules[walletModule]
    const { relayingSuccess, receipt } = await sendRelay(account, { network, walletModule, walletModuleAddress, walletAddress, methodData, nonce, signature, gasPrice, gasLimit }, job)
    if (relayingSuccess) {
      const returnValues = lodash.get(receipt, 'events.TransactionExecuted.returnValues')
      const { wallet, signedHash } = returnValues
      console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)

      if (walletModule === 'CommunityManager') {
        try {
          const { _community: communityAddress } = getParamsFromMethodData(walletModuleABI, 'joinCommunity', methodData)
          console.log(`Requesting token funding for wallet: ${wallet} and community ${communityAddress}`)
          let tokenAddress
          if (lodash.has(job, 'data.transactionBody.tokenAddress')) {
            tokenAddress = toChecksumAddress(lodash.get(job, 'data.transactionBody.tokenAddress'))
          } else {
            const token = await fetchTokenByCommunity(communityAddress)
            tokenAddress = toChecksumAddress(token.address)
          }
          const { phoneNumber } = await UserWallet.findOne({ walletAddress })

          const community = await Community.findOne({ communityAddress })
          const hasBonus = lodash.get(community, `plugins.joinBonus.isActive`, false) && lodash.get(community, `plugins.joinBonus.joinInfo.amount`, false)
          if (hasBonus) {
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
