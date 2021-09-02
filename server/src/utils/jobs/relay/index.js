
const config = require('config')
const lodash = require('lodash')
const { createNetwork } = require('@utils/web3')
const RelayJobParser = require('./parser')

const isAllowedToRelayForeign = (web3, walletModule, walletModuleABI, methodName, methodData) => {
  const allowedModules = ['TransferManager', 'DAIPointsManager']
  console.log(`[isAllowedToRelayForeign] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}`)
  let isAllowed = true
  if (!allowedModules.includes(walletModule)) {
    console.log(`[isAllowedToRelayForeign] FALSE`)
    isAllowed = false
  }
  // TODO add more validations
  console.log(`[isAllowedToRelayForeign] RETURN ${isAllowed}`)
  return isAllowed
}

const isAllowedToRelayHome = (web3, walletModule, walletModuleABI, methodName, methodData) => {
  const allowedModules = ['TransferManager', 'CommunityManager']
  console.log(`[isAllowedToRelayHome] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}`)
  let isAllowed = true
  if (!allowedModules.includes(walletModule)) {
    console.log(`[isAllowedToRelayHome] FALSE`)
    isAllowed = false
  }
  // TODO add more validations
  console.log(`[isAllowedToRelayHome] RETURN ${isAllowed}`)
  return isAllowed
}

const isAllowedToRelay = (web3, walletModule, walletModuleABI, methodName, methodData, networkType) => {
  console.log(`[isAllowedToRelay] walletModule: ${walletModule}, methodName: ${methodName}, methodData: ${methodData}, networkType: ${networkType}`)
  return networkType === 'foreign'
    ? isAllowedToRelayForeign(web3, walletModule, walletModuleABI, methodName, methodData)
    : isAllowedToRelayHome(web3, walletModule, walletModuleABI, methodName, methodData)
}

const sendRelay = async (account, { network, walletModule, walletModuleAddress, walletAddress, methodData, nonce, signature, gasPrice, gasLimit }, job) => {
  const networkType = network === config.get('network.foreign.name') ? 'foreign' : 'home'
  const { createContract, createMethod, send } = createNetwork(networkType, account)
  const walletModuleABI = require(`@constants/abi/${walletModule}`)
  const contract = createContract(walletModuleABI, walletModuleAddress)
  const method = createMethod(contract, 'execute', walletAddress, methodData, nonce, signature, gasPrice, gasLimit)

  const receipt = await send(method, {
    from: account.address,
    gas: config.get('gasLimitForTx.createForeignWallet')
  }, {
    job
  })

  const txSuccess = lodash.get(receipt, 'status')
  const relayingSuccess = txSuccess && lodash.get(receipt, 'events.TransactionExecuted.returnValues.success')
  return { receipt, relayingSuccess }
}

module.exports = {
  sendRelay,
  isAllowedToRelay,
  RelayJobParser
}
