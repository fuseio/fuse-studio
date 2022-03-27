const router = require('express').Router()
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const auth = require('@routes/auth')

/**
 * @api {get} api/v2/admin/wallets/transfers/tokentx/:walletAddress Get token jobs by address on fuse
 * @apiName FetchTokenTxByAddress
 * @apiGroup Admin
 * @apiParam {String} tokenAddress Address of the token
 * @apiParam {String} fromBlockNumer The block number to start fetch from
 * @apiDescription Get token transfer events by address on fuse
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiParam (Query) {String} apiKey API key is used to access the API
 *
 * @apiSuccess {Object} data Array of jobs
 */
router.get('/tokentx/:walletAddress', auth.required, async (req, res) => {
  const { isCommunityAdmin } = req.user
  const { walletAddress } = req.params
  const { tokenAddress, fromBlockNumer = 0 } = req.query
  if (!isCommunityAdmin) {
    return res.status(400).send({ error: 'The user is not a community admin' })
  }

  const jobs = await QueueJob.find({
    'data.toAddress': walletAddress,
    'data.transactionBody.blockNumber': { $gte: fromBlockNumer },
    'data.tokenAddress': tokenAddress.toLowerCase()
  })
  return res.json({ data: jobs })
})

module.exports = router
