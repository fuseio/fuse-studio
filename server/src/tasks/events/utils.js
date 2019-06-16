const config = require('config')
const { web3 } = require('@services/web3/foreign')
const getLastBlockNumber = require('@utils/event').getLastBlockNumber
const handleEvent = require('@events/handlers').handleEvent

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

// TODO: Works only on foreign because of the catch clause
const processPastEvents = async (eventName, contract, { conditions } = defaultOptions) => {
  const lastBlockNumber = await getLastBlockNumber({ eventName, ...conditions })
  const actualEventsCallback = eventsCallback.bind(null, handleEvent)
  try {
    console.log('last block ' + lastBlockNumber)
    return contract.getPastEvents(eventName, { fromBlock: lastBlockNumber, toBlock: 'latest' }, actualEventsCallback)
  } catch (error) {
    console.error(error)
    const latestBlock = await web3.eth.getBlock('latest')
    const pageSize = config.get('network.misc.pageSize')
    for (let i = lastBlockNumber; i < latestBlock.number; i += pageSize) {
      return contract.getPastEvents(eventName, { fromBlock: i, toBlock: i + pageSize }, actualEventsCallback)
    }
  }
}

module.exports = {
  processPastEvents
}
