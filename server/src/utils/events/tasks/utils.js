const config = require('config')
const web3 = require('@services/web3')
const getLastBlockNumber = require('@utils/event').getLastBlockNumber
const handleEvent = require('@utils/events/handlers').handleEvent

const eventsCallback = function (handleEvent, error, events) {
  if (error) {
    console.error(error)
    return
  }
  events.forEach(handleEvent)
}

const defaultOptions = {
  conditions: {}
}

const processPastEvents = async (eventName, contract, {conditions} = defaultOptions) => {
  const lastBlockNumber = await getLastBlockNumber({eventName, ...conditions})
  const handleActualEvent = handleEvent.bind(null, eventName)
  const actualEventsCallback = eventsCallback.bind(null, handleActualEvent)
  try {
    return contract.getPastEvents(eventName, {fromBlock: lastBlockNumber, toBlock: 'latest'}, actualEventsCallback)
  } catch (error) {
    const latestBlock = await web3.eth.getBlock('latest')
    const pageSize = config.get('web3.pageSize')
    for (let i = lastBlockNumber; i < latestBlock.number; i += pageSize) {
      return contract.getPastEvents(eventName, {fromBlock: i, toBlock: i + pageSize}, actualEventsCallback)
    }
  }
}

module.exports = {
  processPastEvents
}
