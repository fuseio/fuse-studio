const config = require('config')
const lodash = require('lodash')
const taskManager = require('@services/taskManager')
const { isStableCoin, adjustDecimals } = require('@utils/token')
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const Community = mongoose.model('Community')
const QueueJob = mongoose.model('QueueJob')
const WalletAction = mongoose.model('WalletAction')
const { readFileSync } = require('fs')
const { createNetwork } = require('@utils/web3')
const { formatActionData } = require('@utils/wallet/actions')

const makeDeposit = async ({
  walletAddress,
  customerAddress,
  communityAddress,
  tokenAddress,
  tokenDecimals,
  amount,
  transactionHash,
  externalId,
  purchase,
  ...rest
}) => {
  console.log(`[makeDeposit] walletAddress: ${walletAddress}, customerAddress: ${customerAddress}, communityAddress: ${communityAddress}, tokenAddress: ${tokenAddress}, amount: ${amount}`)
  if (!transactionHash) {
    console.warn(`transactionHash not given for deposit ${externalId}`)
  }

  const community = await Community.findOne({ communityAddress }).lean()
  if (!community) {
    console.error(`[makeDeposit] could not find community ${communityAddress}`)
    return
  }
  const { plugins } = community
  const isFuseDollar = config.get('plugins.fuseDollar.useOnly') || lodash.get(plugins, 'fuseDollar.isActive')

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
    type: isFuseDollar ? 'fuse-dollar' : 'simple',
    tokenDecimals,
    purchase
  }).save()

  await startDeposit(deposit)
  return deposit
}

const retryDeposit = async ({
  depositId
}) => {
  const deposit = await Deposit.findById(depositId)
  if (deposit.status !== 'failed') {
    const msg = `deposit ${depositId} is not failed at. current status is ${deposit.status}`
    console.error(msg)
    throw new Error(msg)
  }
  return startDeposit(deposit)
}

const startDeposit = async (deposit) => {
  const {
    externalId,
    walletAddress,
    customerAddress,
    tokenAddress,
    amount,
    type,
    tokenDecimals,
    purchase
  } = deposit
  const isFuseDollar = type === 'fuse-dollar'
  if (!isFuseDollar) {
    console.log(`[makeDeposit] transferring to home with relayTokens`)
    const bridgeAddress = config.get('network.foreign.addresses.MultiBridgeMediator')
    return taskManager.now('relayTokens', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: customerAddress, amount }, { isWalletJob: true })
  } else {
    if (config.get('plugins.fuseDollar.verifyStableCoin') && !isStableCoin(tokenAddress)) {
      throw new Error(`token ${tokenAddress} is not a stable coin, cannot convert it to FuseDollar`)
    }
    console.log(`[makeDeposit] Fuse dollar flow`)

    const { web3 } = createNetwork('home')
    const blockNumber = await web3.eth.getBlockNumber()

    // updating the fake-deposit job for soon to be deprecated wallet
    await QueueJob.updateOne({ messageId: externalId }, { $set: { status: 'succeeded', 'data.transactionBody.status': 'confirmed', 'data.transactionBody.blockNumber': blockNumber, 'data.purchase': purchase } })

    const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
    const fuseDollarDecimals = 18
    const adjustedAmount = adjustDecimals(amount, tokenDecimals, fuseDollarDecimals)
    // this data is used as a context for a wallet about the job
    const additionalData = {
      walletAddress: customerAddress,
      externalId,
      actionType: 'fiat-deposit',
      transactionBody: {
        status: 'pending',
        tokenAddress: fuseDollarAddress.toLowerCase()
      }
    }
    return taskManager.now('mintDeposited', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'home', tokenAddress: fuseDollarAddress, receiver: customerAddress, amount: adjustedAmount, ...additionalData }, { isWalletJob: true })
  }
}

const requestDeposit = async ({
  amount,
  customerAddress,
  communityAddress,
  walletAddress,
  externalId,
  provider,
  purchase
}) => {
  const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
  const data = {
    externalId,
    provider,
    walletAddress: customerAddress,
    transactionBody: {
      value: amount,
      status: 'pending',
      tokenAddress: fuseDollarAddress.toLowerCase(),
      tokenDecimal: 18,
      tokenSymbol: 'fUSD',
      asset: 'fUSD',
      timeStamp: (Math.round(new Date().getTime() / 1000)).toString(),
      tokenName: 'Fuse Dollar',
      from: walletAddress,
      to: customerAddress
    },
    purchase
  }
  await new WalletAction({
    name: 'fiat-onramp',
    communityAddress,
    walletAddress: customerAddress,
    data: formatActionData({
      ...data,
      detailedStatus: 'payment-processing'
    }),
    status: 'pending'
  }).save()
  // soon to be deprecated
  return new QueueJob({
    name: 'fiat-processing',
    messageId: externalId,
    communityAddress,
    data: {
      ...data,
      actionType: 'fiat-processing'
    }
  }).save()
}

const getRampAuthKey = () =>
  readFileSync(`./src/constants/pem/ramp/${config.get('plugins.rampInstant.webhook.pemFile')}`).toString()

module.exports = {
  makeDeposit,
  retryDeposit,
  requestDeposit,
  getRampAuthKey
}
