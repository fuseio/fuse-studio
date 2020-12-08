const router = require('express').Router()
var mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

/**
 * @api {get} api/v2/jobs/correlationId/:correlationId Fetch job by correlationId
 * @apiName FetchJob
 * @apiGroup Jobs
 * @apiDescription Fetches agenda job by job's correlationId
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Job object
 */
router.get('/correlationId/:correlationId', auth.required, async (req, res) => {
  const jobs = await agenda.jobs({ 'data.correlationId': req.params.correlationId })
  if (!jobs || jobs.length === 0 || !jobs[0]) {
    return res.status(404).json({ error: 'Job not found' })
  }
  res.json({ data: jobs[0] })
})

/**
 * @api {get} api/v2/jobs/:jobId Fetch job by id
 * @apiName FetchJob
 * @apiGroup Jobs
 * @apiDescription Fetches agenda job by job id
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Job object
 */
router.get('/:id', async (req, res) => {
  const jobs = await agenda.jobs({ _id: mongoose.Types.ObjectId(req.params.id) })
  if (!jobs || jobs.length === 0 || !jobs[0]) {
    const queueJob = await QueueJob.findById(req.params.id)
    if (queueJob && queueJob.name === 'ethFunder') {
      return res.json({ data: queueJob })
    }
    return res.status(404).json({ error: 'Job not found' })
  }
  const job = jobs[0]
  if (job.attrs.name === 'ethFunder') {
    res.json({ data: job.attrs })
  }
  return res.status(404).json({ error: `Job not found try use API V2` })
})

module.exports = router
