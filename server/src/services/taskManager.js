const { receiveMessage, deleteMessage } = require('@services/queue')

const tasks = {
  'createWallet': {
    role: 'wallet',
    bridgeType: 'home'
  }
}

const processTask = (task) => {
  const { name } = task
  console.log({ name })
}

const start = async () => {
  while (true) {
    const message = await receiveMessage()
    if (message) {
      console.log({ message })
      const task = message.Body
      processTask(task)
      await deleteMessage(message)
    }
  }
}

module.exports = {
  start
}
