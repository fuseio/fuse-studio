const mongoose = require('mongoose')
const eventMethods = mongoose.event

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
  return Promise.all(promisses)
}

module.exports = {
  handleEvent,
  handleReceipt
}
