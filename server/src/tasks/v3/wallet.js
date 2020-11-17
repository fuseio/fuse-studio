const config = require('config')
const { createNetwork, signMultiSig } = require('@utils/web3')
const WalletFactoryABI = require('@constants/abi/WalletFactory')
const WalletOwnershipManagerABI = require('@constants/abi/WalletOwnershipManager')
const MultiSigWalletABI = require('@constants/abi/MultiSigWallet')
const homeAddresses = config.get('network.home.addresses')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const Contact = mongoose.model('Contact')
const Invite = mongoose.model('Invite')
const Fork = mongoose.model('Fork')
const branch = require('@utils/branch')
const smsProvider = require('@utils/smsProvider')
const { generateSalt } = require('@utils/web3')
const queue = require('@services/queue')

const getQueryFilter = ({ _id, owner, phoneNumber }) => {
  if (_id) {
    return { _id }
  } else {
    if (phoneNumber) {
      return { phoneNumber, accountAddress: owner }
    }
    return { accountAddress: owner }
  }
}

const createWallet = async (account, { owner, communityAddress, phoneNumber, ens = '', name, amount, symbol, bonusInfo, _id, appName }, job) => {
  console.log(`Using the account ${account.address} to create a wallet on home`)
  const salt = generateSalt()
  const { createContract, createMethod, send } = createNetwork('home', account)
  const walletFactory = createContract(WalletFactoryABI, homeAddresses.WalletFactory)
  const method = createMethod(walletFactory, 'createCounterfactualWallet', owner, Object.values(homeAddresses.walletModules), ens, salt)

  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      console.log(`transaction ${hash} is created by ${account.address}`)
      job.data.txHash = hash
      job.save()
    }
  })
  const walletAddress = receipt.events.WalletCreated.returnValues._wallet
  console.log(`Created wallet contract ${receipt.events.WalletCreated.returnValues._wallet} for account ${owner}`)

  job.data.walletAddress = walletAddress
  if (bonusInfo && communityAddress) {
    bonusInfo.bonusId = walletAddress
    // const bonusJob = null
    const bonusJob = await queue.sendMessage({
      name: 'bonus',
      params: { communityAddress, bonusInfo }
    })
    console.log({ bonusJob })
    job.data.bonusJob = {
      name: bonusJob.name,
      _id: bonusJob._id.toString()
    }
  }
  job.save()

  const queryFilter = getQueryFilter({ _id, owner, phoneNumber })
  const userWallet = await UserWallet.findOneAndUpdate(queryFilter, { walletAddress, salt })
  phoneNumber = userWallet.phoneNumber

  await Contact.updateMany({ phoneNumber }, { walletAddress, state: 'NEW' })

  if (communityAddress) {
    let deepLinkUrl
    if (!appName) {
      const { url } = await branch.createDeepLink({ communityAddress })
      deepLinkUrl = url
    } else {
      const forkData = await Fork.findOne({ appName })
      deepLinkUrl = forkData.deepLinkUrl
    }
    console.log(`Created branch deep link ${deepLinkUrl}`)

    let body = `${config.get('inviteTxt')}\n${deepLinkUrl}`
    if (name && amount && symbol) {
      body = `${name} sent you ${amount} ${symbol}! Click here to redeem:\n${deepLinkUrl}`
    }
    smsProvider.createMessage({ to: phoneNumber, body })

    await Invite.findOneAndUpdate({
      inviterWalletAddress: bonusInfo.receiver,
      inviteePhoneNumber: phoneNumber
    }, {
      inviteeWalletAddress: walletAddress
    }, {
      sort: { createdAt: -1 }
    })
  }

  return receipt
}

const setWalletOwner = async (account, { walletAddress, newOwner }, job) => {
  const { createContract, createMethod, send, web3 } = createNetwork('home', account)

  const userWallet = await UserWallet.findOne({ walletAddress })
  const walletOwnershipManager = createContract(WalletOwnershipManagerABI, userWallet.walletModules.WalletOwnershipManager)
  const setOwnerMethod = createMethod(walletOwnershipManager, 'setOwner', walletAddress, newOwner)
  const setOwnerMethodData = setOwnerMethod.encodeABI()

  const multiSigWallet = createContract(MultiSigWalletABI, config.get('network.home.addresses.MultiSigWallet'))
  const signature = await signMultiSig(web3, account, multiSigWallet, walletOwnershipManager.address, setOwnerMethodData)

  const method = createMethod(multiSigWallet, 'execute', walletOwnershipManager.address, 0, setOwnerMethodData, signature)
  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.data.txHash = hash
      job.save()
    }
  })
  await UserWallet.findOneAndUpdate({ walletAddress }, { accountAddress: newOwner })
  return receipt
}

module.exports = {
  createWallet,
  setWalletOwner
}
