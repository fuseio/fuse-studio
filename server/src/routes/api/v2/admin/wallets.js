const config = require('config')
const homeAddresses = config.get('network.home.addresses')
const router = require('express').Router()
const taskManager = require('@services/taskManager')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const { toChecksumAddress } = require('web3-utils')
const { generateSalt, createNetwork } = require('@utils/web3')
const WalletFactoryABI = require('@constants/abi/WalletFactory')
const { getWalletModules } = require('@utils/wallet')


router.use('/transfers', require('./transfers'))

/**
 * @api {post} /api/v2/admin/wallets/create Create wallet for phone number
 * @apiName CreateWallet
 * @apiGroup Admin
 * @apiDescription Start async job of creating a wallet for phone number (owned by the community admin)
 *
 * @apiExample Create wallet for the provided phone number
 *  POST /api/v2/admin/wallets/create
 *  body: { phoneNumber: '+972546123321' }
 *
 * @apiParam {String} phoneNumber phone number to create a wallet for (body parameter)
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
router.post('/create', auth.required, async (req, res) => {
  const { isCommunityAdmin, communityAddress, identifier, appName } = req.user
  const accountAddress = req.body.defaultOwner ? config.get('network.home.addresses.MultiSigWallet') : req.user.accountAddress
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  try {
    const { phoneNumber, correlationId } = req.body
    const { createContract } = createNetwork('home')
    const walletModules = await getWalletModules(communityAddress)
    const salt = generateSalt()
    const walletFactory = createContract(WalletFactoryABI, homeAddresses.WalletFactory)
    const walletAddress = await walletFactory.methods.getAddressForCounterfactualWallet(accountAddress, Object.values(walletModules), salt).call()
    const userWallet = await new UserWallet({
      phoneNumber,
      accountAddress,
      salt,
      walletOwnerOriginalAddress: accountAddress,
      walletFactoryOriginalAddress: homeAddresses.WalletFactory,
      walletFactoryCurrentAddress: homeAddresses.WalletFactory,
      walletImplementationOriginalAddress: homeAddresses.WalletImplementation,
      walletImplementationCurrentAddress: homeAddresses.WalletImplementation,
      walletModulesOriginal: homeAddresses.walletModules,
      walletModules: homeAddresses.walletModules,
      networks: ['fuse'],
      identifier,
      appName,
      walletAddress
    }).save()
    const job = await taskManager.now('createWallet', { owner: accountAddress, walletAddress, communityAddress, phoneNumber, correlationId, _id: userWallet._id, salt })
    return res.json({ job })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
})

router.post('/create/foreign', auth.admin, async (req, res) => {
  const walletAddress = toChecksumAddress(req.body.walletAddress)
  const userWallet = await UserWallet.findOne({ walletAddress })
  const network = config.get('network.foreign.name')

  if (userWallet.networks.includes(network)) {
    return
  }

  const pendingNetworks = [...userWallet.pendingNetworks, network]
  await UserWallet.findOneAndUpdate({ walletAddress }, { pendingNetworks })

  console.log(`starting a createForeignWallet job for ${JSON.stringify({ walletAddress: userWallet.walletAddress, network })}`)
  const job = await taskManager.now('createForeignWallet', { userWallet, network: config.get('network.foreign.name') })
  return res.json({ job })
})

module.exports = router
