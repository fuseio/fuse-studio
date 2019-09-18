const processPastEvents = require('./utils').processPastEvents
const processPastBridgeMappingEvents = require('./bridge').processPastBridgeMappingEvents
const { proccessPendingTransactions } = require('./transaction')

const TokenFactoryAbi = require('@fuse/token-factory-contracts/build/abi/TokenFactory')
const { web3 } = require('@services/web3/foreign')
const config = require('config')

const tokenFactory = new web3.eth.Contract(TokenFactoryAbi, config.get('network.foreign.addresses.TokenFactory'))
const processPastTokenCreatedEvents = processPastEvents.bind(null, 'TokenCreated', tokenFactory)

module.exports = {
  processPastTokenCreatedEvents,
  processPastBridgeMappingEvents,
  proccessPendingTransactions
}
