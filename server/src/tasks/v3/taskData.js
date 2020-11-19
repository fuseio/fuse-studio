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
  },
  addManager: {
    role: 'wallet',
    bridgeType: 'home',
    description: 'owner'
  }
}

const getTaskData = (taskName) => tasksData[taskName]

module.exports = {
  getTaskData,
  tasksData
}
