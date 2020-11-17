const tasksData = {
  createWallet: {
    role: 'wallet',
    bridgeType: 'home'
  },
  relay: {
    role: 'wallet',
    bridgeType: 'home'
  },
  bonus: {
    role: '*'
  },
  setWalletOwner: {
    role: 'wallet',
    bridgeType: 'home'
  }
}

const getTaskData = (taskName) => tasksData[taskName]

module.exports = {
  getTaskData,
  tasksData
}
