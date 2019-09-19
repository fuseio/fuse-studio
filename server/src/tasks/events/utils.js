const config = require('config')
const { getWeb3 } = require('@services/web3')
const getLastBlockNumber = require('@utils/event').getLastBlockNumber
const { handleEvent } = require('@handlers/events')

const eventsCallback = function (handleEvent, error, events) {
  if (error) {
    console.error(error)
    return
  }
  return events.forEach((event) => handleEvent({ ...event, bridgeType: this.bridgeType }))
}

const defaultOptions = {
  conditions: {}
}

const processPastEvents = async (eventName, contract, { conditions } = defaultOptions) => {
  const lastBlockNumber = await getLastBlockNumber({ eventName, ...conditions })
  const actualEventsCallback = eventsCallback.bind({ bridgeType: contract.bridgeType }, handleEvent)
  try {
    console.log('last block ' + lastBlockNumber)
    return contract.getPastEvents(eventName, { fromBlock: lastBlockNumber, toBlock: 'latest' }, actualEventsCallback)
  } catch (error) {
    console.error(error)
    const web3 = getWeb3(contract)
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
