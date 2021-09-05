const config = require('config')
const { get } = require('lodash')
const { createNetwork } = require('@utils/web3')
const { fetchTokenByCommunity } = require('@utils/graph')
const mongoose = require('mongoose')
const { notifyReceiver } = require('@services/firebase')
const { sendRelay, isAllowedToRelay } = require('@utils/jobs/relay')
const web3Utils = require('web3-utils')
const UserWallet = mongoose.model('UserWallet')
const Community = mongoose.model('Community')
const { deduceTransactionBodyForFundToken } = require('@utils/wallet/misc')

const relay = async (account, { walletAddress, communityAddress, methodName, methodData, nonce, gasPrice, gasLimit, signature, walletModule, network, identifier, appName, nextRelays, relayBody }, job) => {
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
      const returnValues = get(receipt, 'events.TransactionExecuted.returnValues')
      const { wallet, signedHash } = returnValues
      console.log(`Relay transaction executed successfully from wallet: ${wallet}, signedHash: ${signedHash}`)

      if (walletModule === 'CommunityManager') {
        try {
          const communityAddress = get(relayBody, 'params._community')
          console.log(`Requesting token funding for wallet: ${wallet} and community ${communityAddress}`)
          let tokenAddress
          if (get(job.data.transactionBody, 'tokenAddress', false) && get(job.data.transactionBody, 'originNetwork', false)) {
            tokenAddress = web3Utils.toChecksumAddress(get(job.data.transactionBody, 'tokenAddress'))
          } else {
            const token = await fetchTokenByCommunity(communityAddress)
            tokenAddress = web3Utils.toChecksumAddress(token.address)
          }
          const { phoneNumber } = await UserWallet.findOne({ walletAddress })

          const community = await Community.findOne({ communityAddress })
          const hasBonus = get(community, `plugins.joinBonus.isActive`, false) && get(community, `plugins.joinBonus.joinInfo.amount`, false)
          if (hasBonus) {
            const taskManager = require('@services/taskManager')
            const bonusType = 'join'
            const bonusAmount = get(community, `plugins.${bonusType}Bonus.${bonusType}Info.amount`)
            const bonusMaxTimesLimit = get(community, `${bonusType}.maxTimes`, 100)
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
        const { _to, _amount, _token } = relayBody.params
        notifyReceiver({
          receiverAddress: _to,
          tokenAddress: _token,
          amountInWei: _amount,
          communityAddress
        }).catch(console.error)
      }

      if (nextRelays && nextRelays.length > 0) {
        const taskManager = require('@services/taskManager')
        const nextToRelay = nextRelays.shift()
        const nextRelayJob = await taskManager.now('relay', { ...nextToRelay, identifier, appName, nextRelays })
        job.set('data.nextRealyJobId', nextRelayJob._id.toString())
        job.save()
      }
    } else {
      job.set('data.transactionBody', { ...get(job.data, 'transactionBody', {}), status: 'failed', blockNumber: get(receipt, 'blockNumber') })
      job.save()
      console.error(`Relay transaction failed from wallet: ${get(receipt, 'events.TransactionExecuted.returnValues.wallet')}, signedHash: ${get(receipt, 'events.TransactionExecuted.returnValues.signedHash')}`)
    }
    return receipt
  }
}

module.exports = {
  relay
}
