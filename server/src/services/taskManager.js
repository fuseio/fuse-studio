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
  console.log(`starting a taks for ${name}`)
  const taskData = getTaskData(name)
  if (!taskData || !tasks[name]) {
    console.warn(
      `no task data or task function found for task ${name} with task data ${JSON.stringify(
        taskData
      )}, skipping`
    )
    return true
  }
  try {
    const account = await lockAccount(taskData)
    if (!account) {
      console.log(
        `no unlocked accounts found for task ${name} with task data ${JSON.stringify(
          taskData
        )}, retrying soon.`
      )
      return
    }
    console.log(
      `locking the account ${
        account.address
      } for task ${name} with task data ${JSON.stringify(taskData)}`
    )

    const queueJob = await QueueJob.find({ messageId })
    queueJob.accountAddress = account.address
    queueJob.status = 'started'
    await queueJob.save()

    tasks[name](account, params, queueJob)
      .then(() => {
        queueJob.lastFinishedAt = Date.now()
        if (queueJob.status === 'started') {
          queueJob.status = 'succeeded'
        }
        queueJob.save()
        unlockAccount(account._id)
      })
      .catch(err => {
        queueJob.lastFinishedAt = Date.now()
        queueJob.status = 'failed'
        queueJob.save()
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
      `Unexpected rrror received in task ${name} with task data ${JSON.stringify(
        taskData
      )}, skipping. ${err}`
    )
    return false
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
