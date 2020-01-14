const router = require('express').Router()
var mongoose = require('mongoose')
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

/**
 * @api {get} api/v2/jobs/:jobId Fetch job by id
 * @apiName FetchJob
 * @apiGroup Jobs
 * @apiDescription Fetches agenda job by job id
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data User wallet object
 */
router.get('/:id', auth.required, async (req, res) => {
  const jobs = await agenda.jobs({ _id: mongoose.Types.ObjectId(req.params.id) })
  res.json({ data: jobs[0] })
})

module.exports = router
