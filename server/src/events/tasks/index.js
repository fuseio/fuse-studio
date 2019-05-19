const processPastEvents = require('./utils').processPastEvents
const processPastTransferEvents = require('./transfer').processPastTransferEvents
const processPastBridgeMappingEvents = require('./bridge').processPastBridgeMappingEvents
const TokenFactoryAbi = require('@fuse/token-factory-contracts/build/abi/TokenFactory')
const web3 = require('@services/web3')
const addresses = require('@utils/network').addresses

const tokenFactory = new web3.eth.Contract(TokenFactoryAbi, addresses.TokenFactory)
const processPastTokenCreatedEvents = processPastEvents.bind(null, 'TokenCreated', tokenFactory)

module.exports = {
  processPastTokenCreatedEvents,
  processPastTransferEvents,
  processPastBridgeMappingEvents
}
