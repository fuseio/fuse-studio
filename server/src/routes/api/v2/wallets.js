const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const UserWallet = mongoose.model('UserWallet')
/**
 * @api {post} /wallet Create
 * @apiName Request
 * @apiGroup Login
 * @apiDescription Request a verification code to user's phone number
 *
 * @apiParam {String} phoneNumber User phone number
 *
 * @apiSuccess {String} response status - ok
 */
router.post('/:accountAddress', auth.required, async (req, res, next) => {
  // TODO: Map phoneNumer to account (mongo)
  const { accountAddress } = req.body
  const { phoneNumber } = req.user
  new UserWallet({ phoneNumber, accountAddress }).save()

  const job = await agenda.now('createWallet', { owner: accountAddress })

  job.run((err, job) => {
    debugger
  })
  return res.json({ job: job.attrs })
})

module.exports = router
