const { get } = require('lodash')

const tasksData = {
  createWallet: {
    role: 'wallet',
    bridgeType: 'home'
  },
  createForeignWallet: {
    role: 'wallet',
    bridgeType: 'foreign'
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
  },
  ethFunder: {
    role: 'eth',
    bridgeType: '*'
  },
  createToken: {
    role: 'admin',
    bridgeType: 'home'
  },
  mint: {
    role: 'admin',
    bridgeType: 'home'
  },
  burn: {
    role: 'admin',
    bridgeType: 'home'
  },
  burnFrom: {
    role: 'admin',
    bridgeType: 'home'
  },
  adminApprove: {
    role: 'admin',
    bridgeType: 'home'
  },
  adminSpendabilityApprove: {
    role: 'admin',
    bridgeType: 'home'
  },
  adminTransfer: {
    role: 'admin',
    bridgeType: 'home'
  },
  adminSpendabilityTransfer: {
    role: 'admin',
    bridgeType: 'home'
  }
}

const getTaskData = ({ name, params }) => {
  const defaultBridgeType = 'home'

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
