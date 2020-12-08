const { get } = require('lodash')

const defaultBridgeType = 'home'

const tasksData = {
  createWallet: {
    role: 'wallet',
    bridgeType: defaultBridgeType
  },
  createForeignWallet: {
    role: 'wallet',
    bridgeType: 'foreign'
  },
  relay: {
    role: 'wallet',
    bridgeType: defaultBridgeType
  },
  bonus: {
    role: '*'
  },
  setWalletOwner: {
    role: 'wallet',
    bridgeType: defaultBridgeType
  },
  addManager: {
    role: 'wallet',
    bridgeType: defaultBridgeType,
    description: 'owner'
  },
  ethFunder: {
    role: 'eth',
    bridgeType: '*'
  }
}

const getTaskData = ({ name, params }) => {
  const taskData = tasksData[name]
  if (taskData.bridgeType === '*') {
    return { ...tasksData[name], bridgeType: get(params, 'bridgeType', defaultBridgeType) }
  }
  return tasksData[name]
}

module.exports = {
  getTaskData,
  tasksData
}
