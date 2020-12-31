const { get } = require('lodash')

const tasksData = {
  createWallet: {
    role: 'wallet',
    bridgeType: 'home',
    name: 'createWallet'
  },
  createForeignWallet: {
    role: 'wallet',
    bridgeType: 'foreign',
    name: 'createForeignWallet'
  },
  relay: {
    role: 'wallet',
    bridgeType: 'home',
    name: 'relay'
  },
  bonus: {
    role: '*',
    name: 'bonus'
  },
  setWalletOwner: {
    role: 'wallet',
    bridgeType: 'home',
    name: 'setWalletOwner'
  },
  addManager: {
    role: 'wallet',
    bridgeType: 'home',
    description: 'owner',
    name: 'addManager'
  },
  ethFunder: {
    role: 'eth',
    bridgeType: '*',
    name: 'ethFunder'
  },
  createToken: {
    role: 'admin',
    bridgeType: 'home',
    name: 'createToken'
  },
  mint: {
    role: 'admin',
    bridgeType: 'home',
    name: 'mint'
  },
  burn: {
    role: 'admin',
    bridgeType: 'home',
    name: 'burn'
  },
  burnFrom: {
    role: 'admin',
    bridgeType: 'home',
    name: 'burnFrom'
  },
  adminApprove: {
    role: 'admin',
    bridgeType: 'home',
    name: 'adminApprove'
  },
  adminSpendabilityApprove: {
    role: 'admin',
    bridgeType: 'home',
    name: 'adminSpendabilityApprove'
  },
  adminTransfer: {
    role: 'admin',
    bridgeType: 'home',
    name: 'adminTransfer'
  },
  adminSpendabilityTransfer: {
    role: 'admin',
    bridgeType: 'home',
    name: 'adminSpendabilityTransfer'
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

const makeAccountsFilter = ({ name, ...rest }) => ({ ...rest })

module.exports = {
  getTaskData,
  makeAccountsFilter
}
