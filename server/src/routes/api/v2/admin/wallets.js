const config = require('config')
const homeAddresses = config.get('network.home.addresses')
const router = require('express').Router()
const taskManager = require('@services/taskManager')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const { toChecksumAddress } = require('web3-utils')
const { generateSalt } = require('@utils/web3')

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
    const salt = generateSalt()
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
      appName
    }).save()
    const job = await taskManager.now('createWallet', { owner: accountAddress, communityAddress, phoneNumber, correlationId, _id: userWallet._id, salt })
    return res.json({ job })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
})

/**
 * @api {post} /api/v2/admin/wallets/create/foreign Create foreign wallet for the matching home
 * @apiName CreateForeignWallet
 * @apiGroup Admin
 * @apiDescription Start async job of creating a wallet on the foreign network
 *
 * @apiExample Create wallet for the provided wallet address
 *  POST /api/v2/admin/wallets/create/foreign
 *  body: { wallerAddress: '0x92c358fcF6d270F97458C57583FCeabC086c3a26' }
 *
 * @apiParam {String} wallerAddress address create a wallet for, should be an existing wallet on home network (body parameter)
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} Started job data
 */
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
