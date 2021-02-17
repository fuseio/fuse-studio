const config = require('config')
const homeAddresses = config.get('network.home.addresses')
const router = require('express').Router()
const taskManager = require('@services/taskManager')
const { web3 } = require('@services/web3/home')
const { generateSalt } = require('@utils/web3')
const WalletFactoryABI = require('@constants/abi/WalletFactory')
const { createNetwork } = require('@utils/web3')
const auth = require('@routes/auth')
const { getWalletModules } = require('@utils/wallet')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const Invite = mongoose.model('Invite')
const Community = mongoose.model('Community')

router.use('/notify', require('./notify'))
router.use('/transactions', require('./transactions'))
router.use('/transfers', require('./transfers'))
router.use('/actions', require('./actions'))

/**
 * @api {post} api/v2/wallets/ Create wallet contract for user
 * @apiName CreateWallet
 * @apiGroup Wallet
 * @apiDescription Creates wallet contract for the user
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} Started job data
 */
router.post('/', auth.required, async (req, res, next) => {
  const { phoneNumber, accountAddress, identifier, appName } = req.user
  const { correlationId, communityAddress } = req.body
  const transferOwnerWallet = await UserWallet.findOne({ phoneNumber, accountAddress: config.get('network.home.addresses.MultiSigWallet') })
  if (transferOwnerWallet) {
    console.log(`User ${phoneNumber} already has wallet account: ${transferOwnerWallet.walletAddress} owned by MultiSig - need to setOwner`)
    const job = await taskManager.now('setWalletOwner', { walletAddress: transferOwnerWallet.walletAddress, communityAddress, newOwner: accountAddress, correlationId }, { isWalletJob: true })
    return res.json({ job: job })
  } else {
    let userWallet = await UserWallet.findOne({ phoneNumber, accountAddress, appName })
    if (userWallet) {
      const msg = `User ${phoneNumber}, ${accountAddress} already has wallet account: ${userWallet.walletAddress}`
      return res.status(400).json({ error: msg })
    } else {
      const walletModules = await getWalletModules(communityAddress)
      const salt = generateSalt()
      const { createContract } = createNetwork('home')
      const walletFactory = createContract(WalletFactoryABI, homeAddresses.WalletFactory)
      const walletAddress = await walletFactory.methods.getAddressForCounterfactualWallet(accountAddress, walletModules, salt).call()
      userWallet = await new UserWallet({
        phoneNumber,
        accountAddress,
        walletOwnerOriginalAddress: accountAddress,
        walletFactoryOriginalAddress: homeAddresses.WalletFactory,
        walletFactoryCurrentAddress: homeAddresses.WalletFactory,
        walletImplementationOriginalAddress: homeAddresses.WalletImplementation,
        walletImplementationCurrentAddress: homeAddresses.WalletImplementation,
        walletModulesOriginal: walletModules,
        walletModules: walletModules,
        networks: ['fuse'],
        identifier,
        salt,
        appName,
        walletAddress,
        ip: req.clientIp
      }).save()
      const job = await taskManager.now('createWallet', { owner: accountAddress, walletAddress, communityAddress, correlationId, _id: userWallet._id, walletModules, salt }, { isWalletJob: true })
      return res.json({ job: job })
    }
  }
})

router.put('/token/:walletAddress', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { firebaseToken } = req.body
  const response = await UserWallet.updateOne({ walletAddress }, { $push: { firebaseTokens: firebaseToken } })
  return res.json({ data: response })
})

router.put('/token/:walletAddress/delete', auth.required, async (req, res) => {
  const { walletAddress } = req.params
  const { firebaseToken } = req.body
  const userWallet = await UserWallet.updateOne({ walletAddress }, { '$pullAll': { firebaseTokens: [firebaseToken] } })
  return res.json({ data: userWallet })
})

/**
 * @api {get} api/v2/wallets/ Fetch user wallet
 * @apiName FetchWallet
 * @apiGroup Wallet
 * @apiDescription Fetches user's wallet address
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data User wallet object
 */
router.get('/', auth.required, async (req, res, next) => {
  const { phoneNumber, accountAddress } = req.user
  const network = req.query.network || 'fuse'
  const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress, networks: network }, { contacts: 0, firebaseToken: 0 })

  return res.json({ data: userWallet })
})

/**
 * @api {get} api/v2/wallets/:phoneNumber Fetch latest wallet by phone number
 * @apiName FetchWalletByPhoneNumber
 * @apiGroup Wallet
 * @apiDescription Fetches latest wallet created by phone number
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Wallet object
 */
router.get('/:phoneNumber', auth.required, async (req, res, next) => {
  const { appName } = req.user
  const { phoneNumber } = req.params
  const userWallet = await UserWallet.findOne({ phoneNumber, appName }, { contacts: 0, firebaseToken: 0 }).sort({ updatedAt: -1 })

  return res.json({ data: userWallet })
})

/**
 * @api {get} api/v2/wallets/all/:phoneNumber Fetch all wallets by phone number
 * @apiName FetchAllWalletsByPhoneNumber
 * @apiGroup Wallet
 * @apiDescription Fetches all wallets created by phone number
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Array of Wallet objects
 */
router.get('/all/:phoneNumber', auth.required, async (req, res, next) => {
  const { phoneNumber } = req.params
  const userWallets = await UserWallet.find({ phoneNumber }, { contacts: 0 }).sort({ updatedAt: -1 })

  return res.json({ data: userWallets })
})

/**
 * @api {get} api/v2/wallets/exists/:walletAddress Check if wallet exists by wallet address
 * @apiName WalletIsExistByAddress
 * @apiGroup Wallet
 * @apiDescription Checks if wallet exists by wallet address
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Boolean} data True if wallet exists, false otherwide
 */
router.get('/exists/:walletAddress', auth.required, async (req, res, next) => {
  const { walletAddress } = req.params
  const wallet = await UserWallet.findOne({ walletAddress: web3.utils.toChecksumAddress(walletAddress) }, { _id: 1 }).sort({ createdAt: -1 })

  return res.json({ data: !!wallet })
})

/**
 * @api {post} api/v2/wallets/invite/:phoneNumber Create wallet for phone number
 * @apiName WalletInvite
 * @apiGroup Wallet
 * @apiDescription Creates wallet contract for phone number, owned by the server until claimed by the user
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiParam {String} communityAddress community address
 *
 * @apiSuccess {Object} Started job data
 */
router.post('/invite/:phoneNumber', auth.required, async (req, res, next) => {
  const { phoneNumber, accountAddress, identifier, appName } = req.user
  const invitedPhoneNumber = req.params.phoneNumber
  const { communityAddress, name, amount, symbol, correlationId, isFunderDeprecated } = req.body
  const owner = config.get('network.home.addresses.MultiSigWallet')
  const query = { phoneNumber: invitedPhoneNumber }
  if (appName) {
    query.appName = appName
  } else {
    query.appName = { '$exists': false }
  }
  let userWallet = await UserWallet.findOne(query)
  const walletModules = await getWalletModules(communityAddress)
  if (!userWallet) {
    const newUser = {
      phoneNumber: invitedPhoneNumber,
      accountAddress: owner,
      walletOwnerOriginalAddress: owner,
      walletFactoryOriginalAddress: homeAddresses.WalletFactory,
      walletFactoryCurrentAddress: homeAddresses.WalletFactory,
      walletImplementationOriginalAddress: homeAddresses.WalletImplementation,
      walletImplementationCurrentAddress: homeAddresses.WalletImplementation,
      walletModulesOriginal: walletModules,
      walletModules: walletModules,
      networks: ['fuse']
    }
    if (appName) {
      newUser.appName = appName
    }
    userWallet = await new UserWallet(newUser).save()
  } else if (userWallet.walletAddress) {
    const msg = `User ${invitedPhoneNumber} already has wallet account: ${userWallet.walletAddress}`
    return res.status(400).json({ error: msg })
  }

  const inviterUserWallet = await UserWallet.findOne({ phoneNumber, accountAddress, appName }, { contacts: 0 })
  if (!inviterUserWallet) {
    const msg = `Could not find UserWallet for phoneNumber: ${phoneNumber} and accountAddress: ${accountAddress}`
    return res.status(400).json({ error: msg })
  }
  const bonusInfo = {
    phoneNumber,
    identifier,
    receiver: inviterUserWallet.walletAddress,
    bonusType: 'plugins.inviteBonus.inviteInfo'
  }

  await new Invite({
    inviterPhoneNumber: phoneNumber,
    inviterWalletAddress: inviterUserWallet.walletAddress,
    inviteePhoneNumber: invitedPhoneNumber,
    communityAddress,
    appName
  }).save()

  const salt = generateSalt()
  const { createContract } = createNetwork('home')
  const walletFactory = createContract(WalletFactoryABI, homeAddresses.WalletFactory)
  const walletAddress = await walletFactory.methods.getAddressForCounterfactualWallet(owner, walletModules, salt).call()
  const job = await taskManager.now('createWallet', { owner, communityAddress, phoneNumber: invitedPhoneNumber, name, amount, symbol, bonusInfo, correlationId, _id: userWallet._id, appName, walletModules, isFunderDeprecated, salt, walletAddress }, { isWalletJob: true })

  return res.json({ job })
})

/**
 * @api {post} api/v2/wallets/backup Notify server on client wallet backup
 * @apiName WalletBackup
 * @apiGroup Wallet
 * @apiDescription Notify the server that the client has backed up his wallet
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiParam {String} communityAddress community address
 *
 * @apiSuccess {Object} Started job data
 */
router.post('/backup', auth.required, async (req, res, next) => {
  const { phoneNumber, accountAddress, identifier } = req.user
  const { communityAddress, correlationId, isFunderDeprecated } = req.body

  const wallet = await UserWallet.findOne({ phoneNumber, accountAddress }, { contacts: 0 })
  if (!wallet) {
    const msg = `User ${phoneNumber} doesn't have a wallet`
    return res.status(400).json({ error: msg })
  }
  const { walletAddress, backup } = wallet
  if (backup) {
    const msg = `User ${phoneNumber} already backed up its wallet: ${walletAddress}`
    return res.status(400).json({ error: msg })
  }

  await UserWallet.findOneAndUpdate({ phoneNumber, accountAddress }, { backup: true })

  if (communityAddress) {
    if (isFunderDeprecated) {
      const { homeTokenAddress } = await Community.find({ communityAddress })
      const job = await taskManager.now('fundToken', { phoneNumber, receiverAddress: walletAddress, identifier, tokenAddress: homeTokenAddress, communityAddress, bonusType: 'backup' }, { isWalletJob: true })
      return res.json({ job: job })
    } else {
      const bonusInfo = {
        phoneNumber,
        identifier,
        receiver: walletAddress,
        bonusType: 'plugins.backupBonus.backupInfo',
        bonusId: phoneNumber
      }
      const job = await taskManager.now('bonus', { communityAddress, bonusInfo, correlationId }, { isWalletJob: true })
      return res.json({ job: job })
    }
  }

  return res.json({ response: 'ok' })
})

/**
 * @api {post} api/v2/wallets/foreign Create wallet contract for user on Ethereum
 * @apiName CreateWalletForeign
 * @apiGroup Wallet
 * @apiDescription [Deprecated!] Creates wallet contract for the user on Ethereum
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} Started job data
 */
router.post('/foreign', auth.required, async (req, res, next) => {
  // this endpoint is deprecated
  return res.json({ })
})

module.exports = router
