const {
  sendMessage,
  receiveMessage,
  deleteMessage
} = require('@services/queue')
const tasks = require('@tasks/v3')
const { getTaskData } = require('@tasks/v3/taskData')
const { lockAccount, unlockAccount } = require('@utils/account')
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

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
    account = await lockAccount(taskData)
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
  const response = await sendMessage({
    name,
    params
  })
  const job = await new QueueJob({
    name,
    data: params,
    messageId: response.MessageId
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
