const config = require('config')
const lodash = require('lodash')
const taskManager = require('@services/taskManager')
const { isStableCoin } = require('@utils/token')
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const Community = mongoose.model('Community')
const { isProduction } = require('@utils/env')

const makeDeposit = async ({
  walletAddress,
  customerAddress,
  communityAddress,
  tokenAddress,
  amount,
  transactionHash,
  externalId,
  ...rest
}) => {
  console.log(`[makeDeposit] walletAddress: ${walletAddress}, customerAddress: ${customerAddress}, communityAddress: ${communityAddress}, tokenAddress: ${tokenAddress}, amount: ${amount}`)
  if (!transactionHash && !isProduction()) {
    transactionHash = '0x' + Math.random().toString(36).substring(7)
    console.warn(`transactionHash not found for deposit with exernalId ${externalId}. ${transactionHash} generated`)
  }

  const community = await Community.findOne({ communityAddress }).lean()
  if (!community) {
    console.error(`[makeDeposit] could not find community ${communityAddress}`)
    return
  }
  const { plugins } = community
  const bridgeAddress = config.get('network.foreign.addresses.MultiBridgeMediator')
  const isFuseDollar = lodash.get(plugins, 'fuseDollar.isActive')

  const deposit = await new Deposit({
    ...rest,
    externalId,
    transactionHash,
    walletAddress,
    customerAddress,
    communityAddress,
    tokenAddress,
    amount,
    status: 'pending',
    type: isFuseDollar ? 'fuse-dollar' : 'simple'
  }).save()

  if (!isFuseDollar) {
    console.log(`[makeDeposit] transferring to home with relayTokens`)
    taskManager.now('relayTokens', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: customerAddress, amount }, { generateDeduplicationId: true })
  } else {
    if (config.get('env') === 'production' && !isStableCoin(tokenAddress)) {
      throw new Error(`token ${tokenAddress} is not a stable coin, cannot convert it to FuseDollar`)
    }
    console.log(`[makeDeposit] Fuse dollar flow`)
    // taskManager.now('relayTokens', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: walletAddress, amount }, { generateDeduplicationId: true })
    const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
    taskManager.now('mintDeposited', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'home', tokenAddress: fuseDollarAddress, receiver: customerAddress, amount }, { generateDeduplicationId: true })
  }
  return deposit
}

module.exports = {
  makeDeposit
}
