const config = require('config')
const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')

/**
 * @api {post} /wallet/:accountAddress Create wallet contract for user
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
  const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress })
  if (!userWallet) {
    await new UserWallet({ phoneNumber, accountAddress }).save()
  } else if (userWallet.walletAddress) {
    const msg = `User ${phoneNumber} already has wallet account: ${userWallet.walletAddress}`
    return res.status(400).json({ error: msg })
  }

  await agenda.now('createWallet', { owner: accountAddress })

  return res.json({ response: 'ok' })
})

/**
 * @api {post} /wallet/ Fetch user wallet
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
  const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress })

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
  const userWallet = await UserWallet.findOne({ phoneNumber }).sort({ createdAt: -1 })

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
 * @apiSuccess {String} response Response status - ok
 */
router.post('/invite/:phoneNumber', auth.required, async (req, res, next) => {
  const { phoneNumber } = req.params
  const accountAddress = config.get('network.home.addresses.MultiSigWallet')

  const userWallet = await UserWallet.findOne({ phoneNumber })
  if (!userWallet) {
    await new UserWallet({ phoneNumber, accountAddress }).save()
  } else if (userWallet.walletAddress) {
    const msg = `User ${phoneNumber} already has wallet account: ${userWallet.walletAddress}`
    return res.status(400).json({ error: msg })
  }

  await agenda.now('createWallet', { owner: accountAddress })

  return res.json({ response: 'ok' })
})

module.exports = router
