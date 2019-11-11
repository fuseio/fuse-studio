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
 * @apiParam {String} accountAddress User account address
 *
 * @apiSuccess {String} response Response status - ok
 */
router.post('/:accountAddress', auth.required, async (req, res, next) => {
  const { accountAddress } = req.params
  const { phoneNumber } = req.user
  new UserWallet({ phoneNumber, accountAddress }).save()

  await agenda.now('createWallet', { owner: accountAddress })

  return res.json({ response: 'ok' })
})

module.exports = router
