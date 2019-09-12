const { getWeb3 } = require('@services/web3')
const { getAbi } = require('@constants/abi')
const { logsToEvents } = require('@utils/web3/events')
const { isEmpty } = require('@utils/web3/receipt')
const { get } = require('lodash')
const mongoose = require('mongoose')
const eventMethods = mongoose.event
const transactionMethods = mongoose.transaction

const token = require('./token')
const bridge = require('./bridge')
const community = require('./community')

const eventsHandlers = {
  TokenCreated: token.handleTokenCreatedEvent,
  Transfer: token.handleTransferEvent,
  OwnershipTransferred: token.handleOwnershipTransferredEvent,
  BridgeMappingUpdated: bridge.handleBridgeMappingUpdatedEvent,
  HomeBridgeDeployed: bridge.handleHomeBridgeDeployed,
  TransferManagerSet: community.handleTransferManagerSet,
  EntityAdded: community.handleEntityAdded,
  EntityRemoved: community.handleEntityRemoved,
  EntityRolesUpdated: community.handleEntityRolesUpdated,
  RuleAdded: community.handleRuleAdded,
  RuleRemoved: community.handleRuleRemoved
}

const handleEvent = async function (event, receipt) {
  const eventName = event.event
  const blockNumber = event.blockNumber
  if (eventsHandlers.hasOwnProperty(eventName)) {
    try {
      console.log(`Start processing event ${eventName} at ${blockNumber} blockNumber`)
      await eventsHandlers[eventName](event, receipt)
      console.log(`Done processing ${eventName} event at ${blockNumber} blockNumber`)
      await eventMethods.create({ eventName, ...event })
    } catch (error) {
      console.log(`Failed to process ${eventName} event at ${blockNumber} blockNumber`)
      console.error(error)
      throw error
    }
  }
}

const handleReceipt = async (receipt) => {
  const transaction = await transactionMethods.start(receipt)
  const status = get(transaction, 'status')
  if (status === 'DONE' || status === 'FAILED') {
    console.log(`Transaction ${receipt.transactionHash} already executed with status ${status}`)
    return
  }
  try {
    console.log(`Starting to execute transaction ${receipt.transactionHash}`)
    const events = Object.entries(receipt.events)
    let promisses = []
    for (let [eventName, event] of events) {
      if (eventsHandlers.hasOwnProperty(eventName)) {
        if (Array.isArray(event)) {
          const eventPromisses = event.map((singleEvent) => handleEvent(singleEvent, receipt))
          promisses = [...promisses, ...eventPromisses]
        } else {
          promisses.push(handleEvent(event, receipt))
        }
      }
    }
    await Promise.all(promisses)
    return transactionMethods.done(receipt)
  } catch (error) {
    await transactionMethods.failed(receipt)
    throw error
  }
}

const handleTransactionHash = async ({ transactionHash, bridgeType, abiName }) => {
  const web3 = getWeb3({ bridgeType })
  const receipt = await web3.eth.getTransactionReceipt(transactionHash)
  if (receipt && !isEmpty(receipt)) {
    const abi = getAbi(abiName)
    const contract = new web3.eth.Contract(abi)
    const events = logsToEvents(receipt.logs, contract)
    receipt.events = events
    return handleReceipt(receipt)
  } else {
    return transactionMethods.pending({ transactionHash, bridgeType, abiName })
  }
}

module.exports = {
  handleTransactionHash,
  handleEvent,
  handleReceipt
}
