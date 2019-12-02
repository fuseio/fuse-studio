const processPastEvents = require('./utils').processPastEvents
const processPastBridgeMappingEvents = require('./bridge').processPastBridgeMappingEvents
const { proccessPendingTransactions } = require('./transaction')

const TokenFactoryAbi = require('@fuse/token-factory-contracts/abi/TokenFactory')
const { createContract } = require('@services/web3/foreign')
const config = require('config')

const tokenFactory = createContract(TokenFactoryAbi, config.get('network.foreign.addresses.TokenFactory'))
const processPastTokenCreatedEvents = processPastEvents.bind(null, 'TokenCreated', tokenFactory)

module.exports = {
  processPastTokenCreatedEvents,
  processPastBridgeMappingEvents,
  proccessPendingTransactions
}
