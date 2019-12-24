const config = require('config')
const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

/**
 * @api {post} /wallets/ Create wallet contract for user
 * @apiName CreateWallet
 * @apiGroup Wallet
 * @apiDescription Creates wallet contract for the user
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} response Response status - ok
 */
router.post('/', auth.required, async (req, res, next) => {
  const { phoneNumber, accountAddress } = req.user
  const transferOwnerWallet = await UserWallet.findOne({ phoneNumber, accountAddress: config.get('network.home.addresses.MultiSigWallet') })
  if (transferOwnerWallet) {
    console.log(`User ${phoneNumber} already has wallet account: ${transferOwnerWallet.walletAddress} owned by MultiSig - need to setOwner`)
    const job = await agenda.now('setWalletOwner', { walletAddress: transferOwnerWallet.walletAddress, newOwner: accountAddress })
    return res.json({ job: job.attrs })
  } else {
    const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress })
    if (userWallet) {
      const msg = `User ${phoneNumber}, ${accountAddress} already has wallet account: ${userWallet.walletAddress}`
      return res.status(400).json({ error: msg })
    } else {
      await new UserWallet({ phoneNumber, accountAddress }).save()
      const job = await agenda.now('createWallet', { owner: accountAddress })
      return res.json({ job: job.attrs })
    }
  }
})

/**
 * @api {get} /wallets/ Fetch user wallet
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
  const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress }, { contacts: 0 })

  return res.json({ data: userWallet })
})

/**
 * @api {get} /wallets/:phoneNumber Fetch latest wallet by phone number
 * @apiName FetchWalletByPhoneNumber
 * @apiGroup Wallet
 * @apiDescription Fetches latest wallet created by phone number
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Wallet object
 */
router.get('/:phoneNumber', auth.required, async (req, res, next) => {
  const { phoneNumber } = req.params
  const userWallet = await UserWallet.findOne({ phoneNumber }, { contacts: 0 }).sort({ createdAt: -1 })

  return res.json({ data: userWallet })
})

/**
 * @api {post} /wallets/invite/:phoneNumber Create wallet for phone number
 * @apiName WalletInvite
 * @apiGroup Wallet
 * @apiDescription Creates wallet contract for phone number, owned by the server until claimed by the user
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiParam {String} communityAddress community address
 *
 * @apiSuccess {String} response Response status - ok
 */
router.post('/invite/:phoneNumber', auth.required, async (req, res, next) => {
  const { phoneNumber } = req.params
  const { communityAddress } = req.body
  const accountAddress = config.get('network.home.addresses.MultiSigWallet')

  const userWallet = await UserWallet.findOne({ phoneNumber })
  if (!userWallet) {
    await new UserWallet({ phoneNumber, accountAddress }).save()
  } else if (userWallet.walletAddress) {
    const msg = `User ${phoneNumber} already has wallet account: ${userWallet.walletAddress}`
    return res.status(400).json({ error: msg })
  }

  const job = await agenda.now('createWallet', { owner: accountAddress, communityAddress, phoneNumber })

  return res.json({ job: job.attrs })
})

module.exports = router
