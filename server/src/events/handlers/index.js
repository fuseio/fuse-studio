const eventUtils = require('@utils/event')

const business = require('./business')
const token = require('./token')
const bridge = require('./bridge')

const eventsHandlers = {
  TokenCreated: token.handleTokenCreatedEvent,
  Transfer: token.handleTransferEvent,
  BridgeMappingUpdated: bridge.handleBridgeMappingUpdatedEvent,
  EntityAdded: business.handleEntityAddedEvent,
  EntityReplaced: business.handleEntityReplacedEvent,
  SimpleListCreated: business.handleSimpleListCreatedEvent
}

const handleEvent = function (event) {
  const eventName = event.event
  if (eventsHandlers.hasOwnProperty(eventName)) {
    return eventsHandlers[eventName](event).then(() => {
      const blockNumber = event.blockNumber
      console.log(`recieved ${eventName} event at ${blockNumber} blockNumber`)
      eventUtils.addNewEvent({
        eventName,
        ...event
      })
    })
  }
}

const handleReceipt = async (receipt) => {
  const events = Object.entries(receipt.events)
  let promisses = []
  for (let [eventName, event] of events) {
    if (eventsHandlers.hasOwnProperty(eventName)) {
      if (Array.isArray(event)) {
        const eventPromisses = event.map((singleEvent) => handleEvent(singleEvent))
        promisses = [...promisses, ...eventPromisses]
      } else {
        promisses.push(handleEvent(event))
      }
    }
  }
  return Promise.all(promisses)
}

module.exports = {
  handleEvent,
  handleReceipt
}
