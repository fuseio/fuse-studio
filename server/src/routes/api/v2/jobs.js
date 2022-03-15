const router = require('express').Router()
var mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')
const { get, isEmpty } = require('lodash')
const taskManager = require('@services/taskManager')
const { ObjectId } = require('mongodb')

router.get('/external', auth.required, async (req, res) => {
  const { externalId } = req.query
  const txs = await QueueJob.find({ 'data.externalId': externalId })
  if (isEmpty(txs)) {
    return res.status(400).json({ error: `externalId: ${externalId} has no match job` })
  }

  return res.json({
    data: txs.map(({ _id, data: { transactionBody, txHash, externalId } }) => ({
      jobId: _id,
      value: get(transactionBody, 'value', 0),
      tokenName: get(transactionBody, 'tokenName', ''),
      tokenDecimal: get(transactionBody, 'tokenDecimal', ''),
      tokenSymbol: get(transactionBody, 'asset', ''),
      tokenAddress: get(transactionBody, 'tokenAddress', ''),
      contractAddress: get(transactionBody, 'tokenAddress', ''),
      status: get(transactionBody, 'status', ''),
      type: get(transactionBody, 'type', ''),
      from: get(transactionBody, 'from', ''),
      to: get(transactionBody, 'to', ''),
      timeStamp: get(transactionBody, 'timeStamp'),
      blockNumber: get(transactionBody, 'blockNumber'),
      hash: txHash,
      externalId
    }))
  })
})

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
 * @apiDescription Fetch job by id
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Job object
 */
router.get('/:id', auth.required, async (req, res) => {
  const jobs = await agenda.jobs({ _id: mongoose.Types.ObjectId(req.params.id) })
  if (!jobs || jobs.length === 0 || !jobs[0]) {
    const job = await QueueJob.findById(req.params.id)
    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }
    return res.json({ data: job })
  }
  return res.json({ data: jobs[0] })
})

/**
 * @api {get} api/v2/jobs/retry/:jobId Retry failed job by id
 * @apiName RetryJob
 * @apiGroup Jobs
 * @apiDescription Retry failed job by id
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Job object
 */
router.post('/retry/:id', auth.admin, async (req, res) => {
  const { id } = req.params
  const failedJob = await QueueJob.findById(id)
  const job = await taskManager.retry(failedJob)
  return res.json({ job })
})

/**
 * @api {get} api/v2/jobs/retry Retry failed job by query
 * @apiName RetryJobByQuery
 * @apiGroup Jobs
 * @apiDescription Retry failed job by id
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {Object} data Job object
 */
router.post('/retry', auth.admin, async (req, res) => {
  const jobsIds = req.body

  if (!Array.isArray(jobsIds)) {
    throw Error('request data is empty or invalid')
  }

  const _ids = jobsIds.map(id => ObjectId(id))
  const cancelledJobs = await QueueJob.find({ _id: { $in: _ids } })

  console.log(`found ${cancelledJobs.length} cancelled jobs to retry`)
  const retryJobs = []
  for (const cancelledJob of cancelledJobs) {
    const job = await taskManager.retry(cancelledJob)
    retryJobs.push(job)
  }
  return res.json({ data: retryJobs, size: retryJobs.length })
})

module.exports = router
