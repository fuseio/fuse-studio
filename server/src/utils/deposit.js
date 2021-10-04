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
const { trackDepositStatus } = require('@utils/analytics')
const { createNetwork } = require('@utils/web3')
const { formatActionData } = require('@utils/wallet/actions')
const { fetchTokenPrice } = require('@utils/fuseswap')
const { validateBonusAlowance } = require('@utils/jobs')
const { notifyReceiver } = require('@services/firebase')

const isNetworkSupported = (network) => {
  const supportedNetwork = config.get('deposit.supportedNetworks')
  return supportedNetwork.includes(network)
}

const isDepositTypeAvailable = (type) => config.get('deposit.availableTypes').includes(type)

const fetchBonusAmount = async ({ tokenAddress, amountInUSD }) => {
  const tokenPrice = await fetchTokenPrice(tokenAddress)
  const bonusAmount = new BigNumber(amountInUSD.toString()).div(tokenPrice).integerValue(BigNumber.ROUND_UP)
  return bonusAmount
}

const checkDepositBonus = async (deposit) => {
  const {
    customerAddress: walletAddress,
    communityAddress,
    humanAmount
  } = deposit
  const fuseToken = config.get('network.home.native')

  const userWallet = await UserWallet.findOne({ walletAddress })
  const { phoneNumber } = userWallet

  const bonusAmountInUSD = new BigNumber(humanAmount).multipliedBy(config.get('bonus.topup.percentage'))
  const bonusAmount = await fetchBonusAmount({ tokenAddress: fuseToken.address, amountInUSD: bonusAmountInUSD })

  const bonusMaxTimesLimit = 1
  const bonusType = 'topup'
  const tokenAddress = fuseToken.address
  const receiverAddress = walletAddress

  // check if user already recieved deposit bonus
  if (!await validateBonusAlowance({ phoneNumber, tokenAddress, communityAddress, receiverAddress, bonusType, bonusMaxTimesLimit })) {
    return
  }
  const jobData = { role: 'fuse-funder', phoneNumber, receiverAddress, tokenAddress, communityAddress, bonusMaxTimesLimit, bonusAmount: bonusAmount.toNumber(), bonusType }
  return taskManager.now('fundToken', {
    ...jobData,
    transactionBody: {
      value: adjustDecimals(bonusAmount, 0, 18),
      to: receiverAddress,
      tokenName: fuseToken.name,
      tokenDecimal: fuseToken.decimals,
      tokenSymbol: fuseToken.symbol,
      asset: fuseToken.symbol,
      tokenAddress: fuseToken.address,
      bonusType
    }
  }, { isWalletJob: true })
}

const checkReferralBonus = async (deposit) => {
  const {
    customerAddress: walletAddress,
    communityAddress,
    humanAmount
  } = deposit
  const fuseToken = config.get('network.home.native')

  const { referralAddress } = await UserWallet.findOne({ walletAddress })
  if (!referralAddress) {
    console.log(`No referral address is defined for wallet ${walletAddress}`)
    return
  }
  const referralWallet = await UserWallet.findOne({ walletAddress: referralAddress })
  if (!referralWallet) {
    console.warn(`referal wallet address ${referralAddress} from wallet ${walletAddress} was not found in db`)
    return
  }
  const bonusAmountInUSD = new BigNumber(humanAmount).multipliedBy(config.get('bonus.referral.percentage'))
  const bonusAmount = await fetchBonusAmount({ tokenAddress: fuseToken.address, amountInUSD: bonusAmountInUSD })
  const bonusType = 'referral'
  const tokenAddress = fuseToken.address
  const receiverAddress = referralWallet.walletAddress
  const phoneNumber = referralWallet.phoneNumber

  const jobData = { role: 'fuse-funder', phoneNumber, receiverAddress, tokenAddress, communityAddress, bonusAmount: bonusAmount.toNumber(), bonusType }
  return taskManager.now('fundToken', {
    ...jobData,
    transactionBody: {
      value: adjustDecimals(bonusAmount, 0, 18),
      to: receiverAddress,
      tokenName: fuseToken.name,
      tokenDecimal: fuseToken.decimals,
      tokenSymbol: fuseToken.symbol,
      asset: fuseToken.symbol,
      tokenAddress: fuseToken.address,
      bonusType
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
    humanAmount: adjustDecimals(amount, tokenDecimals, 0),
    provider,
    externalId,
    status: error ? 'failed' : 'pending',
    type: error ? 'naive' : getDepositType({ tokenAddress, network }),
    purchase,
    network,
    depositError: error
  }).save()

  await new WalletAction({
    name: 'depositInitiated',
    communityAddress,
    data: {
      provider: 'ramp',
      value: amount,
      status: 'confirmed',
      tokenAddress,
      tokenDecimal: 18,
      tokenSymbol: 'fUSD',
      asset: 'fUSD',
      timeStamp: (Math.round(new Date().getTime() / 1000)).toString(),
      tokenName: 'Fuse Dollar'
    },
    walletAddress: customerAddress,
    tokenAddress: tokenAddress.toLowerCase(),
    status: error ? 'failed' : 'confirmed'
  }).save()

  trackDepositStatus({ address: customerAddress, status: 'Pendig' })
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

  trackDepositStatus({ address: customerAddress, status: 'Success' })

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
      isDeposit: true,
      receiverAddress: customerAddress,
      tokenAddress,
      amountInWei: amount,
      tokenDecimals: parseInt(tokenDecimals)
    })
      .catch(console.error)
    await checkDepositBonus(deposit)
    await checkReferralBonus(deposit)
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

const cancelDeposit = async ({ customerAddress, externalId, provider, purchase }) => {
  trackDepositStatus({ address: customerAddress, status: 'Failed' })
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
