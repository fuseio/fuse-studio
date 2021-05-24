const config = require('config')
const taskManager = require('@services/taskManager')
const { isStableCoin, adjustDecimals } = require('@utils/token')
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const { readFileSync } = require('fs')

const isNetworkSupported = (network) => {
  const supportedNetwork = config.get('deposit.supportedNetworks')
  return supportedNetwork.includes(network)
}

const isDepositTypeAvailable = (type) => config.get('deposit.availableTypes').includes(type)

const getDepositType = ({ tokenAddress, network }) => {
  // const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
  if (network === 'fuse') {
    // the tokens are recieved on the fuse network
    return 'naive'
  } else {
    if (isStableCoin(tokenAddress, network)) {
      // mint of fUSD is required
      return 'mint'
    } else {
      return 'relay'
    }
  }
}

const verifyDeposit = async ({ externalId }) => {
  const deposit = await Deposit.findOne({ externalId })
  if (deposit) {
    throw new Error(`deposit with external id ${externalId} already received`)
  }
}

const initiateDeposit = async ({
  amount,
  customerAddress,
  walletAddress,
  externalId,
  provider,
  tokenDecimals,
  tokenAddress,
  communityAddress,
  purchase,
  network
}) => {
  let error
  if (!isNetworkSupported(network)) {
    error = `Network ${network} is not supported`
    console.warn(error)
  }

  // TODO: check token decimals
  await verifyDeposit({ externalId })

  const deposit = await new Deposit({
    walletAddress,
    customerAddress,
    communityAddress,
    tokenAddress: tokenAddress.toLowerCase(),
    tokenDecimals,
    amount,
    provider,
    externalId,
    status: error ? 'failed' : 'pending',
    type: error ? 'naive' : getDepositType({ tokenAddress, network }),
    purchase,
    network,
    depositError: error
  }).save()
  console.log({ deposit })
}

const fulfillDeposit = async ({
  transactionHash,
  externalId,
  provider,
  purchase
}) => {
  // TODO: check tokenHash
  if (!transactionHash) {
    throw new Error(`transactionHash not given for deposit ${externalId}`)
  }
  const deposit = await Deposit.findOne({ externalId, provider, status: 'pending' })
  if (!deposit) {
    throw new Error(`No matching deposit found ${externalId}, ${provider}`)
  }

  deposit.transactionHash = transactionHash
  deposit.purchase = purchase
  await deposit.save()

  await performDeposit(deposit)
  return deposit
}

const performDeposit = async (deposit) => {
  if (deposit.status !== 'pending') {
    throw new Error(`deposit data does not allow to deposit ${deposit}`)
  }
  const {
    walletAddress,
    customerAddress,
    amount,
    type,
    tokenDecimals
  } = deposit
  if (!isDepositTypeAvailable(type)) {
    throw new Error(`deposit type of ${type} currently not available for deposit ${deposit.externalId}`)
  }

  deposit.status = 'started'
  await deposit.save()

  if (type === 'naive') {
    console.warn(`Funds already received on the Fuse Network, no need to take any action`)
  } else if (type === 'relay') {
    const bridgeAddress = config.get('network.foreign.addresses.MultiBridgeMediator')
    return taskManager.now('relayTokens', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: customerAddress, amount }, { isWalletJob: true })
  } else if (type === 'mint') {
    console.log(`[fulfillDeposit] Fuse dollar flow`)

    const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
    const fuseDollarDecimals = 18
    const adjustedAmount = adjustDecimals(amount, tokenDecimals, fuseDollarDecimals)

    taskManager.now('mintDeposited', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'home', tokenAddress: fuseDollarAddress, receiver: customerAddress, amount: adjustedAmount }, { isWalletJob: true })
  }
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
  if (!isNetworkSupported(deposit.network)) {
    throw new Error(`Network ${deposit.network} is not supported`)
  }

  deposit.status = 'pending'
  await deposit.save()
  return performDeposit(deposit)
}

const cancelDeposit = async ({ externalId, provider, purchase }) => {
  return Deposit.updateOne({ externalId, provider }, { status: 'failed', purchase }, { new: true })
}

const getRampAuthKey = () =>
  readFileSync(`./src/constants/pem/ramp/${config.get('plugins.rampInstant.webhook.pemFile')}`).toString()

module.exports = {
  initiateDeposit,
  fulfillDeposit,
  retryDeposit,
  getRampAuthKey,
  performDeposit,
  cancelDeposit
}
