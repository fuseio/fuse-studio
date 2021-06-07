const config = require('config')
const BigNumber = require('bignumber.js')
const taskManager = require('@services/taskManager')
const { isStableCoin, adjustDecimals } = require('@utils/token')
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const WalletAction = mongoose.model('WalletAction')
const UserWallet = mongoose.model('UserWallet')

const { readFileSync } = require('fs')
const { isProduction } = require('@utils/env')
const { createNetwork } = require('@utils/web3')
const { formatActionData } = require('@utils/wallet/actions')
const { notifyReceiver } = require('@services/firebase')
const { fetchTokenPrice } = require('@utils/token')

const isNetworkSupported = (network) => {
  const supportedNetwork = config.get('deposit.supportedNetworks')
  return supportedNetwork.includes(network)
}

const isDepositTypeAvailable = (type) => config.get('deposit.availableTypes').includes(type)

const startDepositBonusJob = async ({ walletAddress, communityAddress }) => {
  const bonusAmountInUSD = config.get('bonus.deposit.usd')
  const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
  const fuseTokenAddress = config.get('network.foreign.addresses.FuseToken')

  const userWallet = await UserWallet.findOne({ walletAddress })
  const { phoneNumber } = userWallet
  const { priceUSD } = await fetchTokenPrice(fuseTokenAddress)
  const bonusAmount = new BigNumber(bonusAmountInUSD.toString()).div(priceUSD).integerValue(BigNumber.ROUND_UP).toString()
  const jobData = { phoneNumber, receiverAddress: walletAddress, identifier: phoneNumber, tokenAddress: fuseDollarAddress, communityAddress, bonusType: 'topup', bonusMaxTimesLimit: 1, bonusAmount }
  return taskManager.now('fundToken', {
    ...jobData,
    transactionBody: {
      value: adjustDecimals(bonusAmount, 0, 18),
      to: walletAddress,
      tokenName: 'Fuse Dollar',
      tokenDecimal: 18,
      tokenSymbol: 'fUSD',
      asset: 'fUSD',
      tokenAddress: fuseDollarAddress
    }
  }, { isWalletJob: true })
}
const getDepositType = ({ tokenAddress, network }) => {
  if (network === 'fuse') {
    // the tokens are recieved on the fuse network
    return 'naive'
  } else {
    if (isStableCoin(tokenAddress, network)) {
      // mint of fUSD is required
      return 'mint'
    } else {
      // need relay the tokens via bridge manually
      return 'relay'
    }
  }
}

const verifyTokenAddress = ({ tokenAddress, tokenDecimals }) => { }

const verifyDeposit = async ({ externalId, network, tokenAddress, tokenDecimals }) => {
  const deposit = await Deposit.findOne({ externalId })
  if (deposit) {
    throw new Error(`deposit with external id ${externalId} already received`)
  }
  if (isProduction()) {
    verifyTokenAddress({ network, tokenAddress, tokenDecimals })
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
  await verifyDeposit({ externalId, network, tokenDecimals, tokenAddress })

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
    tokenDecimals,
    tokenAddress,
    communityAddress,
    transactionHash
  } = deposit
  if (!isDepositTypeAvailable(type)) {
    throw new Error(`deposit type of ${type} currently not available for deposit ${deposit.externalId}`)
  }

  deposit.status = 'started'
  await deposit.save()

  if (type === 'naive') {
    console.warn(`Funds already received on the Fuse Network, no need to take any action`)
    const { web3 } = createNetwork('home')
    const blockNumber = await web3.eth.getBlockNumber()
    const data = {
      walletAddress: customerAddress,
      communityAddress,
      transactionBody: {
        value: amount,
        status: 'confirmed',
        tokenAddress,
        tokenDecimal: 18,
        tokenSymbol: 'fUSD',
        asset: 'fUSD',
        timeStamp: (Math.round(new Date().getTime() / 1000)).toString(),
        tokenName: 'Fuse Dollar',
        from: walletAddress,
        to: customerAddress,
        txHash: transactionHash,
        blockNumber
      }
    }
    await new WalletAction({
      name: 'fiat-deposit',
      communityAddress,
      walletAddress: customerAddress,
      data: formatActionData(data),
      tokenAddress: data.transactionBody.tokenAddress,
      status: 'confirmed'
    }).save()
    deposit.status = 'succeeded'
    await deposit.save()
    notifyReceiver({
      isTopUp: true,
      receiverAddress: customerAddress,
      tokenAddress,
      amountInWei: amount
    }).catch(console.error)

    await startDepositBonusJob({
      walletAddress, communityAddress
    })
  } else if (type === 'relay') {
    const bridgeAddress = config.get('network.foreign.addresses.MultiBridgeMediator')
    return taskManager.now('relayTokens', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'foreign', bridgeAddress, tokenAddress, receiver: customerAddress, amount }, { isWalletJob: true })
  } else if (type === 'mint') {
    console.log(`[fulfillDeposit] Fuse dollar flow`)

    const fuseDollarAddress = config.get('network.home.addresses.FuseDollar')
    const fuseDollarDecimals = 18
    const adjustedAmount = adjustDecimals(amount, tokenDecimals, fuseDollarDecimals)

    const transactionBody = {
      value: adjustedAmount,
      from: '0x0000000000000000000000000000000000000000',
      to: customerAddress,
      tokenName: 'Fuse Dollar',
      tokenDecimal: fuseDollarDecimals,
      asset: 'fUSD',
      tokenAddress: fuseDollarAddress
    }
    taskManager.now('mintDeposited', { depositId: deposit._id, accountAddress: walletAddress, bridgeType: 'home', tokenAddress: fuseDollarAddress, receiver: customerAddress, amount: adjustedAmount, walletAddress: customerAddress, communityAddress, transactionBody }, { isWalletJob: true })
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
  cancelDeposit,
  startDepositBonusJob
}
