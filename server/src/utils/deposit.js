const config = require('config')
const lodash = require('lodash')
const taskManager = require('@services/taskManager')
const { isStableCoin } = require('@utils/token')
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const ActionOnRelay = mongoose.model('ActionOnRelay')
const Community = mongoose.model('Community')

const makeDeposit = async (deposit) => {
  const {
    walletAddress,
    customerAddress,
    communityAddress,
    tokenAddress,
    amount
  } = deposit
  console.log(`[makeDeposit] walletAddress: ${walletAddress}, customerAddress: ${customerAddress}, communityAddress: ${communityAddress}, tokenAddress: ${tokenAddress}, amount: ${amount}`)
  const community = await Community.findOne({ communityAddress }).lean()
  if (!community) {
    console.error(`[makeDeposit] could not find community ${communityAddress}`)
    return
  }
  const { homeTokenAddress, plugins } = community
  const bridgeAddress = config.get('network.foreign.addresses.MultiBridgeMediator')
  const isFuseDollar = lodash.get(plugins, 'fuseDollar.isActive')
  await new Deposit(deposit).save()

  if (!isFuseDollar) {
    console.log(`[makeDeposit] transferring to home with relayTokens`)
    taskManager.now('relayTokens', { accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: customerAddress, amount }, { generateDeduplicationId: true })
  } else {
    if (!isStableCoin(tokenAddress)) {
      throw new Error(`token ${tokenAddress} is not a stable coin, cannot convert it to FuseDollar`)
    }
    console.log(`[makeDeposit] Fuse dollar flow`)

    await new ActionOnRelay({
      accountAddress: walletAddress,
      tokenAddress: homeTokenAddress,
      actionType: 'mint',
      bridgeType: 'home',
      status: 'WAITING',
      data: {
        bridgeType: 'home',
        tokenAddress: config.get('network.home.addresses.FuseDollar'),
        amount,
        mintTo: customerAddress
      }
    }).save()

    console.log(`[makeDeposit] isFuseDollar after transferToCustomer save()`)
    taskManager.now('relayTokens', { accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: walletAddress, amount }, { generateDeduplicationId: true })
  }
}

module.exports = {
  makeDeposit
}
