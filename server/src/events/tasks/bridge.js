const config = require('config')
const { web3 } = require('@services/web3/home')

const processPastEvents = require('./utils').processPastEvents
const bridgeMapperABI = require('@constants/abi/BridgeMapper')

const processPastBridgeMappingEvents = async () => {
  const address = config.get('network.home.addresses.BridgeMapper')
  const basicTokenContract = new web3.eth.Contract(bridgeMapperABI, address)
  const eventName = 'BridgeMappingUpdated'
  await processPastEvents(eventName, basicTokenContract)
}

module.exports = {
  processPastBridgeMappingEvents
}
