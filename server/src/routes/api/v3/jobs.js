const router = require('express').Router()
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const auth = require('@routes/auth')

/**
 * @api {get} api/v3/jobs/:jobId Fetch job by id
 * @apiName FetchJob
 * @apiGroup Jobs
 * @apiDescription Fetches queue job by job id
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Job object
 */
router.get('/:id', auth.required, async (req, res) => {
  const job = await QueueJob.findById(req.params.id)
  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }
  return res.json({ data: job })
})

module.exports = router
