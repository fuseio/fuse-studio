const config = require('config')
const lodash = require('lodash')
const taskManager = require('@services/taskManager')
const { isStableCoin, adjustDecimals } = require('@utils/token')
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const Community = mongoose.model('Community')
const WalletAction = mongoose.model('WalletAction')
const { readFileSync } = require('fs')

const depositStarted = async ({
  amount,
  customerAddress,
  walletAddress,
  externalId,
  provider,
  tokenDecimals,
  tokenAddress,
  purchase
}) => {
  const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
  const isFuseDollar = tokenAddress.toLowerCase() === fuseDollarAddress.toLowerCase()

  await new Deposit({
    walletAddress,
    customerAddress,
    tokenAddress: tokenAddress.toLowerCase(),
    tokenDecimals,
    amount,
    provider,
    externalId,
    status: 'pending',
    type: isFuseDollar ? 'fuse-dollar' : 'simple',
    purchase
  }).save()
}

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

    const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
    const fuseDollarDecimals = 18
    const adjustedAmount = adjustDecimals(amount, tokenDecimals, fuseDollarDecimals)

    return taskManager.now('mintDeposited', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'home', tokenAddress: fuseDollarAddress, receiver: customerAddress, amount: adjustedAmount, externalId, purchase }, { isWalletJob: true })
  }
}

const fulfilDeposit = ({
  externalId,
  transactionHash,
  purchase
}) => {
  return Deposit.updateOne({ externalId }, { transactionHash, status: 'succeeded', purchase })
}

const cancelDeposit = async ({ externalId, type, purchase }) => {
  const deposit = await Deposit.findOne({ externalId })
  deposit.set('purchase', purchase)
  deposit.set('status', 'failed')
  await deposit.save()

  const action = await WalletAction.findOne({ 'data.externalId': externalId })
  action.fail(`Credit card purchare failed with status ${type}`)
  return action.save()
}

const getRampAuthKey = () =>
  readFileSync(`./src/constants/pem/ramp/${config.get('plugins.rampInstant.webhook.pemFile')}`).toString()

module.exports = {
  depositStarted,
  makeDeposit,
  retryDeposit,
  getRampAuthKey,
  cancelDeposit,
  fulfilDeposit
}
