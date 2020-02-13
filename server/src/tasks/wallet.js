const config = require('config')
const { createNetwork, signMultiSig } = require('@utils/web3')
const WalletFactoryABI = require('@constants/abi/WalletFactory')
const WalletOwnershipManagerABI = require('@constants/abi/WalletOwnershipManager')
const MultiSigWalletABI = require('@constants/abi/MultiSigWallet')
const homeAddresses = config.get('network.home.addresses')
const { withAccount } = require('@utils/account')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const Contact = mongoose.model('Contact')
const Invite = mongoose.model('Invite')
const branch = require('@utils/branch')
const twilio = require('@utils/twilio')
const { GraphQLClient } = require('graphql-request')
const graphClient = new GraphQLClient(config.get('graph.url'))
const request = require('request-promise-native')

const createWallet = withAccount(async (account, { owner, communityAddress, phoneNumber, ens = '', name, amount, symbol, bonusInfo }, job) => {
  const { web3, createContract, createMethod, send } = createNetwork('home', account)
  const walletFactory = createContract(WalletFactoryABI, homeAddresses.WalletFactory)
  const method = createMethod(walletFactory, 'createWallet', owner, Object.values(homeAddresses.walletModules), ens)

  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
  const walletAddress = receipt.events.WalletCreated.returnValues._wallet
  console.log(`Created wallet contract ${receipt.events.WalletCreated.returnValues._wallet} for account ${owner}`)

  job.attrs.data.walletAddress = walletAddress
  job.save()

  let cond = { accountAddress: owner }

  if (phoneNumber) {
    cond.phoneNumber = phoneNumber
  }

  const userWallet = await UserWallet.findOneAndUpdate(cond, { walletAddress })
  phoneNumber = userWallet.phoneNumber

  await Contact.updateMany({ phoneNumber }, { walletAddress, state: 'NEW' })

  if (communityAddress) {
    const { url } = await branch.createDeepLink({ communityAddress })
    console.log(`Created branch deep link ${url}`)

    const inviteTxt = `${name} sent you ${amount} ${symbol}! Click here to redeem:\n${url}`
    twilio.createMessage({ to: phoneNumber, body: inviteTxt })

    await Invite.findOneAndUpdate({
      inviterWalletAddress: bonusInfo.receiver,
      inviteePhoneNumber: phoneNumber
    }, {
      inviteeWalletAddress: walletAddress
    }, {
      sort: { createdAt: -1 }
    })

    if (bonusInfo) {
      try {
        bonusInfo.bonusId = walletAddress
        console.log(`Requesting token bonus for wallet: ${bonusInfo.receiver}`)
        const query = `{tokens(where: {communityAddress: "${communityAddress}"}) {address, communityAddress, originNetwork}}`
        const { tokens } = await graphClient.request(query)
        const tokenAddress = web3.utils.toChecksumAddress(tokens[0].address)
        const originNetwork = tokens[0].originNetwork
        request.post(`${config.get('funder.urlBase')}bonus/token`, {
          json: true,
          body: { accountAddress: bonusInfo.receiver, tokenAddress, originNetwork, bonusInfo }
        })
      } catch (e) {
        console.log(`Error on token bonus for wallet: ${bonusInfo.receiver}`, e)
      }
    }
  }

  return receipt
})

const setWalletOwner = withAccount(async (account, { walletAddress, newOwner }, job) => {
  const { createContract, createMethod, send, web3 } = createNetwork('home', account)

  const walletOwnershipManager = createContract(WalletOwnershipManagerABI, config.get('network.home.addresses.walletModules.WalletOwnershipManager'))
  const setOwnerMethod = createMethod(walletOwnershipManager, 'setOwner', walletAddress, newOwner)
  const setOwnerMethodData = setOwnerMethod.encodeABI()

  const multiSigWallet = createContract(MultiSigWalletABI, config.get('network.home.addresses.MultiSigWallet'))
  const signature = await signMultiSig(web3, account, multiSigWallet, walletOwnershipManager.address, setOwnerMethodData)

  const method = createMethod(multiSigWallet, 'execute', walletOwnershipManager.address, 0, setOwnerMethodData, signature)
  const receipt = await send(method, {
    from: account.address
  }, {
    transactionHash: (hash) => {
      job.attrs.data.txHash = hash
      job.save()
    }
  })
  await UserWallet.findOneAndUpdate({ walletAddress }, { accountAddress: newOwner })
  return receipt
})

module.exports = {
  createWallet,
  setWalletOwner
}
