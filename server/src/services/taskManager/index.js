const {
  tasksFIFOMessenger
} = require('@services/queue')
const lodash = require('lodash')
const tasks = require('@tasks/sqs')
const { createActionFromJob, successAndUpdateByJob, failAndUpdateByJob } = require('@utils/wallet/actions')
const { getTaskData, makeAccountsFilter } = require('./taskData')
const { get } = require('lodash')
const { lockAccount, unlockAccount } = require('@utils/account')
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const cancelTask = async (queueJob) => {
  const { messageId } = queueJob
  console.log(`Skipping a task ${queueJob._id} with ${queueJob.name} and messageId ${messageId}. Reason: cancel request`)
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
  const task = message.Body
  const { name, params } = task
  if (!tasks[name]) {
    console.warn(
      `no task named ${name} was found, skipping`
    )
    return true
  }

  console.log({ task })

  let queueJob = await QueueJob.findOne({ messageId })
  if (queueJob.status === 'cancelRequested') {
    await cancelTask(queueJob)
    return true
  }
  console.log(`starting a task for ${name}`)
  const taskData = getTaskData(task)

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

    queueJob.accountAddress = account.address
    queueJob.status = 'started'
    await queueJob.save()

    tasks[name](account, params, queueJob)
      .then(async () => {
        await queueJob.successAndUpdate()
        await successAndUpdateByJob(queueJob)
        unlockAccount(account._id)
      })
      .catch(async err => {
        await queueJob.fail(err)
        await queueJob.save()
        await failAndUpdateByJob(queueJob)
        unlockAccount(account._id)
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
      queueJob = await QueueJob.findOne({ messageId })
    }

    // marking queueJob as failed
    if (queueJob) {
      await queueJob.fail(err)
      await queueJob.save()
      await failAndUpdateByJob(queueJob)
    }
    if (account && account._id) {
      unlockAccount(account._id)
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

  const response = await tasksFIFOMessenger.sendMessage({
    name,
    params
  }, options)
  const communityAddress = lodash.get(params, 'communityAddress')
  const job = await new QueueJob({
    name,
    data: params,
    messageId: response.MessageId,
    ...(communityAddress && { communityAddress })
  }).save()

  if (options.isWalletJob) {
    await createActionFromJob(job)
  }
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
  now
}
