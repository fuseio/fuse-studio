const config = require('config')
const CurrencyFactoryAbi = require('../../constants/abi/CurrencyFactory')
const processTokenCreatedEvent = require('../events/db').processTokenCreatedEvent
const communityUtils = require('../community')

const web3 = require('@services/web3')
const getAddresses = require('../network').getAddresses

const addresses = getAddresses()

const CurrencyFactoryContract = new web3.eth.Contract(CurrencyFactoryAbi, addresses.CurrencyFactory)

const eventCallback = async (error, event) => {
  if (error) {
    console.error(error)
    return
  }
  processTokenCreatedEvent(event)
}

const eventsCallback = (error, events) => {
  if (error) {
    console.error(error)
    return
  }
  events.forEach((event) => eventCallback(error, event))
}

const getPastEvents = async () => {
  const lastBlockNumber = await communityUtils.getLastBlockNumber()
  try {
    CurrencyFactoryContract.getPastEvents('TokenCreated', {fromBlock: lastBlockNumber, toBlock: 'latest'}, eventsCallback)
  } catch (error) {
    const latestBlock = await web3.eth.getBlock('latest')
    const pageSize = config.get('web3.pageSize')
    for (let i = lastBlockNumber; i < latestBlock.number; i += pageSize) {
      CurrencyFactoryContract.getPastEvents('TokenCreated', {fromBlock: i, toBlock: i + pageSize}, eventsCallback)
    }
  }
}

module.exports = {
  getPastEvents
}
