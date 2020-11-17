const { sendMessage, receiveMessage, deleteMessage } = require('@services/queue')
const tasks = require('@tasks/v3')
const { getTaskData } = require('@tasks/v3/taskData')
const { lockAccount, unlockAccount } = require('@utils/account')
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const processTask = async (task) => {
  const { name, params } = task
  console.log(`starting a taks for ${name}`)
  const taskData = getTaskData(name)
  if (!taskData || !tasks[name]) {
    console.warn(`no task data or task function found for task ${name} with task data ${JSON.stringify(taskData)}, skipping`)
    return true
  }

  const account = await lockAccount(taskData)
  if (!account) {
    console.log(`no unlocked accounts found for task ${name} with task data ${JSON.stringify(taskData)}, retrying soon.`)
    return
  }
  console.log(`locking the account ${account.address} for task ${name} with task data ${JSON.stringify(taskData)}`)

  const queueJob = await new QueueJob({
    name,
    accountAddress: account.address,
    data: params
  }).save()

  tasks[name](account, params, queueJob).then(() => {
    queueJob.lastFinishedAt = Date.now()
    if (queueJob.status === 'running') {
      queueJob.status = 'succeeded'
    }
    queueJob.save()
    unlockAccount(account._id)
  }).catch(err => {
    queueJob.lastFinishedAt = Date.now()
    queueJob.status = 'failed'
    queueJob.save()
    unlockAccount(account._id)
    console.error(`Error received in task ${name} with task data ${JSON.stringify(taskData)}. ${err}`)
    console.log({ err })
  })
  return true
}

const now = (name, params) => {
  return sendMessage({
    name,
    params
  })
}

const start = async () => {
  while (true) {
    const message = await receiveMessage()
    if (message) {
      const task = message.Body
      console.log({ task })
      const response = await processTask(task)
      console.log({ response })
      if (response) {
        await deleteMessage(message)
      }
    }
  }
}

module.exports = {
  start,
  now
}
