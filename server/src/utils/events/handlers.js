const communityUtils = require('../community')
const eventUtils = require('../event')

const handleTokenCreatedEvent = async (event) => {
  const blockNumber = event.blockNumber
  console.log(`recieved TokenCreated event at ${blockNumber} blockNumber`)
  const eventArgs = event.returnValues
  const ccAddress = eventArgs.token
  const owner = eventArgs.owner
  const factoryAddress = event.address
  const communityData = await communityUtils.getCommunityData(factoryAddress, ccAddress)

  return communityUtils.upsertCommunity({ccAddress, owner, blockNumber, ...communityData})
}

const handleMarketOpenEvent = async (event) => {
  const blockNumber = event.blockNumber
  console.log(`recieved MarketOpen event at ${blockNumber} blockNumber`)
  const eventArgs = event.returnValues
  const mmAddress = eventArgs.marketMaker

  return communityUtils.openMarket(mmAddress)
}

const eventsHandlers = {
  TokenCreated: handleTokenCreatedEvent,
  MarketOpen: handleMarketOpenEvent
}

const handleEvent = function (eventName, event) {
  if (eventsHandlers.hasOwnProperty(eventName)) {
    return eventsHandlers[eventName](event).then(() => {
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
        const eventPromisses = event.map((singleEvent) => handleEvent(eventName, singleEvent))
        promisses = [...promisses, ...eventPromisses]
      } else {
        promisses.push(handleEvent(eventName, event))
      }
    }
  }
  return Promise.all(promisses)
}

module.exports = {
  handleEvent,
  handleReceipt
}
