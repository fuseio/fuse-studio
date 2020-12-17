const {
  sendMessage,
  receiveMessage,
  deleteMessage
} = require('@services/queue')
const lodash = require('lodash')
const tasks = require('@tasks/sqs')
const { getTaskData } = require('./taskData')
const { lockAccount, unlockAccount } = require('@utils/account')
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const getWorkerAccount = (taskData, task) => {
  if (taskData.role === 'admin') {
    const { accountAddress } = task
    if (accountAddress) {
      return lockAccount({ address: accountAddress })
    } else {
      const msg = `no account address supplied for task  with task data ${JSON.stringify(
        taskData
      )}`
      console.warn(msg)
      throw Error(msg)
    }
  }
  return lockAccount(taskData)
}

const startTask = async message => {
  const messageId = message.MessageId
  const task = message.Body
  const { name, params } = task
  console.log(`starting a task for ${name}`)
  const taskData = getTaskData(task)
  if (!taskData || !tasks[name]) {
    console.warn(
      `no task data or task function found for task ${name} with task data ${JSON.stringify(
        taskData
      )}, skipping`
    )
    return true
  }
  let account, queueJob
  try {
    account = await getWorkerAccount(taskData, task)
    if (!account) {
      console.log(
        `no unlocked accounts found for task ${name} with task data ${JSON.stringify(
          taskData
        )}, retrying soon.`
      )
      return
    }

    queueJob = await QueueJob.findOne({ messageId })
    queueJob.accountAddress = account.address
    queueJob.status = 'started'
    await queueJob.save()

    tasks[name](account, params, queueJob)
      .then(async () => {
        await queueJob.successAndUpdate()
        unlockAccount(account._id)
      })
      .catch(async err => {
        await queueJob.failAndUpdate(err)
        unlockAccount(account._id)
        console.error(
          `Error received in task ${name} with task data ${JSON.stringify(
            taskData
          )}. ${err}`
        )
        console.log({ err })
      })

    return true
  } catch (err) {
    console.error(
      `Unexpected error received in task ${name} with task data ${JSON.stringify(
        taskData
      )}, skipping. ${err}`
    )
    if (!queueJob) {
      queueJob = await QueueJob.findOne({ messageId })
    }

    // marking queueJob as failed
    if (queueJob) {
      await queueJob.failAndUpdate(err)
    }
    if (account && account._id) {
      unlockAccount(account._id)
    }
    console.log({ err })
    return true
  }
}

const now = async (name, params) => {
  const correlationId = lodash.get(params, 'correlationId')
  if (correlationId) {
    const savedJob = await QueueJob.findOne({ 'data.correlationId': correlationId, status: { $ne: 'failed' } })
    if (savedJob) {
      throw Error(`Job with the correlationId ${correlationId} already exists. jobId: ${savedJob._id}, status: ${savedJob.status}.`)
    }
  }
  const response = await sendMessage({
    name,
    params
  })
  const { communityAddress } = params
  const job = await new QueueJob({
    name,
    data: params,
    messageId: response.MessageId,
    ...(communityAddress && { communityAddress })
  }).save()
  return job
}

const start = async () => {
  console.log('starting SQS task manager')
  while (true) {
    const message = await receiveMessage()
    if (message) {
      const toBeDeleted = await startTask(message)
      if (toBeDeleted) {
        await deleteMessage(message)
      }
    }
  }
}

module.exports = {
  start,
  now
}
