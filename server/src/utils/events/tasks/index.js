const processPastEvents = require('./utils').processPastEvents
const CurrencyFactoryAbi = require('@constants/abi/CurrencyFactory')

const web3 = require('@services/web3')
const getAddresses = require('@utils/network').getAddresses

const addresses = getAddresses()

const CurrencyFactoryContract = new web3.eth.Contract(CurrencyFactoryAbi, addresses.CurrencyFactory)

const processPastTokenCreatedEvents = processPastEvents.bind(null, 'TokenCreated', CurrencyFactoryContract)
const processPastMarketOpenEvents = processPastEvents.bind(null, 'MarketOpen', CurrencyFactoryContract)

module.exports = {
  processPastTokenCreatedEvents,
  processPastMarketOpenEvents
}
