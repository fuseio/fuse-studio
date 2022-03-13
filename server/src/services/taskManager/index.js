const {
  tasksFIFOMessenger
} = require('@services/queue')
const lodash = require('lodash')
const tasks = require('@tasks/sqs')
const BigNumber = require('bignumber.js')
const { createActionFromJob, successAndUpdateByJob, failAndUpdateByJob } = require('@utils/wallet/actions')
const { getTaskData, makeAccountsFilter } = require('./taskData')
const { get, has, isEqual } = require('lodash')
const { lockAccount, unlockAccount } = require('@utils/account')
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')
const { web3 } = require('@services/web3/home')

const checkUnlock = async (queueJob) => {
  if (lodash.get(queueJob, 'data.role') === 'fuse-funder') {
    const accountBalance = await web3.eth.getBalance(queueJob.accountAddress)
    if (new BigNumber(accountBalance).isLessThan('100000000000000000000')) {
      console.log(`Low balance. Do not unlock account ${queueJob.accountAddress}`)
      return false
    }
  }
  return true
}

const cancelTask = async (queueJob) => {
  console.log(`Skipping a task ${queueJob._id} with ${queueJob.name}. Reason: cancel request`)
  queueJob.accountAddress = lodash.get(queueJob, 'data.accountAddress')
  queueJob.status = 'cancelled'
  return queueJob.save()
}

const getWorkerAccount = (taskData, taskParams) => {
  if (lodash.has(taskParams, 'accountAddress')) {
    const { accountAddress } = taskParams
    if (accountAddress) {
      return lockAccount({ address: accountAddress })
    } else {
      const msg = `no account address supplied for task  with task data ${JSON.stringify(
        taskData
      )}`
      console.warn(msg)
      throw Error(msg)
    }
  } else if (lodash.has(taskParams, 'role')) {
    return lockAccount(makeAccountsFilter({ ...taskData, role: taskParams.role }))
  }
  return lockAccount(makeAccountsFilter(taskData))
}

const startTask = async message => {
  const messageId = message.MessageId
  const messageBody = message.Body
  const { name, jobId, params } = messageBody

  if (!tasks[name]) {
    console.warn(
      `no task named ${name} was found, skipping`
    )
    return true
  }

  console.log({ messageBody })
  console.log(`received a task ${name} with message id ${messageId} and job id ${jobId}`)

  let queueJob = await QueueJob.findById(jobId)

  if (!queueJob) {
    console.error(`Job was not found by id ${jobId}. Skipping`)
    return true
  }

  if (isEqual(get(queueJob, 'status'), 'cancelRequested')) {
    await cancelTask(queueJob)
    return true
  }

  console.log(`starting a task ${name} with message id ${messageId}, job id is ${get(queueJob, '_id')}`)
  const taskData = getTaskData(messageBody)

  if (!taskData) {
    console.warn(
      `no task data was found for  task ${name} with task data ${JSON.stringify(
        taskData
      )}, skipping`
    )
    return true
  }
  let account
  try {
    account = await getWorkerAccount(taskData, params)
    if (!account) {
      console.log(
        `no unlocked accounts found for task ${name} and params ${JSON.stringify(params)}, with task data ${JSON.stringify(
          taskData
        )}, retrying soon.`
      )
      return
    }

    if (!queueJob) {
      queueJob = await QueueJob.findById(jobId)
    }

    queueJob.accountAddress = account.address
    queueJob.status = 'started'
    await queueJob.save()

    tasks[name](account, params, queueJob)
      .then(async () => {
        await queueJob.successAndUpdate()
        await successAndUpdateByJob(queueJob)
        if (await checkUnlock(queueJob)) {
          unlockAccount(account._id)
        }
      })
      .catch(async err => {
        await queueJob.fail(err)
        await queueJob.save()
        await failAndUpdateByJob(queueJob)
        if (await checkUnlock(queueJob)) {
          unlockAccount(account._id)
        }
        console.error(
          `Error received in task ${name} with id ${get(queueJob, '_id')} and task data ${JSON.stringify(
            taskData
          )}. ${err}`
        )
        console.log({ err })
      })
    return true
  } catch (err) {
    console.error(
      `Unexpected error received in task ${name} with id ${get(queueJob, '_id')} and task data ${JSON.stringify(
        taskData
      )}, skipping. ${err}`
    )
    if (!queueJob) {
      queueJob = await QueueJob.findById(jobId)
    }

    // marking queueJob as failed
    if (queueJob) {
      await queueJob.fail(err)
      await queueJob.save()
      await failAndUpdateByJob(queueJob)
      if (account && account._id && await checkUnlock(queueJob)) {
        unlockAccount(account._id)
      }
    } else {
      if (account && account._id) {
        unlockAccount(account._id)
      }
    }

    console.log({ err })
    return true
  }
}

const now = async (name, params, options = {}) => {
  const correlationId = lodash.get(params, 'correlationId')
  if (correlationId) {
    const savedJob = await QueueJob.findOne({ 'data.correlationId': correlationId, status: { $ne: 'failed' } })
    if (savedJob) {
      throw Error(`Job with the correlationId ${correlationId} already exists. jobId: ${savedJob._id}, status: ${savedJob.status}.`)
    }
  }

  if (name === 'relay' || name === 'fundToken') {
    if (!has(options, 'isWalletJob')) {
      options.isWalletJob = true
    }
  }

  const communityAddress = lodash.get(params, 'communityAddress')
  const job = await new QueueJob({
    name,
    data: params,
    ...(communityAddress && { communityAddress })
  }).save()

  await tasksFIFOMessenger.sendMessage({
    name,
    jobId: job._id,
    params
  }, options)

  if (options.isWalletJob) {
    await createActionFromJob(job)
  }
  return job
}

const retry = async (failedJob) => {
  const { _id, status, retryJob } = failedJob
  console.log(`Requested a retry of the job ${_id}`)

  if (status !== 'failed' && status !== 'cancelled' && status !== 'cancelRequested') {
    throw Error(`Cannot retry job ${_id} with status ${status}`)
  } else if (retryJob) {
    throw Error(`job ${_id} already retried with id ${retryJob}`)
  }
  const job = await now(failedJob.name, failedJob.data)
  failedJob.retryJob = job._id
  await failedJob.save()

  console.log(`Retry of job ${_id} is scheduled in a new jobb ${job._id}`)
  return job
}

const start = async () => {
  console.log('starting SQS task manager')
  while (true) {
    const message = await tasksFIFOMessenger.receiveMessage()
    if (message) {
      const toBeDeleted = await startTask(message)
      if (toBeDeleted) {
        await tasksFIFOMessenger.deleteMessage(message)
      }
    }
  }
}

module.exports = {
  start,
  now,
  retry
}
