const { receiveMessage, deleteMessage } = require('@services/queue')
const tasks = require('@tasks')
const { lockAccount, unlockAccount } = require('@utils/account')
const mongoose = require('mongoose')
const QueueJob = mongoose.model('QueueJob')

const tasksData = {
  createWallet: {
    role: 'wallet',
    bridgeType: 'home'
  },
  relay: {
    role: 'wallet',
    bridgeType: 'home'
  }
}

const processTask = async (task) => {
  const { name, params } = task
  console.log(`starting a taks for ${name}`)
  const taskData = tasksData[name]
  const account = await lockAccount(taskData)
  const queueJob = await new QueueJob({
    name,
    data: params
  }).save()
  console.log({ account })
  if (!account) {
    return null
  }
  tasks[name](account, params, queueJob).then(async () => {
    queueJob.lastFinishedAt = Date.now()
    await queueJob.save()
    await unlockAccount(account._id)
  })
  return true
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
  start
}
