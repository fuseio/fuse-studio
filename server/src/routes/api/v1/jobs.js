const router = require('express').Router()
var mongoose = require('mongoose')
const { agenda } = require('@services/agenda')
const QueueJob = mongoose.model('QueueJob')

// /**
//  * @api {get} api/v1/jobs/:jobId Fetch ethFunder job by id
//  * @apiName FetchEthFunderJob
//  * @apiGroup Jobs
//  * @apiDescription Fetches agenda job by job id
//  *
//  * @apiSuccess {Object} data Job object
//  */
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
