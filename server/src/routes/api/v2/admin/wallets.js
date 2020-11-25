const config = require('config')
const homeAddresses = config.get('network.home.addresses')
const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
const { toChecksumAddress } = require('web3-utils')

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
  const { isCommunityAdmin, identifier, appName } = req.user
  const accountAddress = req.body.defaultOwner ? config.get('network.home.addresses.MultiSigWallet') : req.user.accountAddress
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }
  try {
    const { phoneNumber, correlationId } = req.body
    const userWallet = await new UserWallet({
      phoneNumber,
      accountAddress,
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
    const job = await agenda.now('createWallet', { owner: accountAddress, phoneNumber, correlationId, _id: userWallet._id })
    return res.json({ job: job.attrs })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
})


/**
 * @api {post} /api/v2/admin/wallets/create/foreign Create foreign wallet for the matching home
 * @apiName CreateForeignWallet
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
router.post('/create/foreign', auth.admin, async (req, res) => {
  const walletAddress = toChecksumAddress(req.body.walletAddress)
  const userWallet = await UserWallet.findOne({ walletAddress })
  console.log({ userWallet })
  const network = config.get('network.foreign.name')

  if (userWallet.networks.includes(network)) {
    return
  }

  const pendingNetworks = [...userWallet.pendingNetworks, network]
  await UserWallet.findOneAndUpdate({ walletAddress }, { pendingNetworks })

  console.log(`starting a createForeignWallet job for ${JSON.stringify({ walletAddress: userWallet.walletAddress, network })}`)
  const job = await agenda.now('createForeignWallet', { userWallet, network: config.get('network.foreign.name') })
  return res.json({ job: job.attrs })
})

module.exports = router
