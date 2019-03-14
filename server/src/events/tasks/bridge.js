const config = require('config')
const Web3 = require('web3')

const processPastEvents = require('./utils').processPastEvents
const bridgeMapperABI = require('@constants/abi/BridgeMapper.js')

const processPastBridgeMappingEvents = async () => {
  const web3 = new Web3(config.get('web3.fuseProvider'))
  const address = config.get('web3.addresses.fuse.BridgeMapper')
  const basicTokenContract = new web3.eth.Contract(bridgeMapperABI, address)
  const eventName = 'BridgeMappingUpdated'
  await processPastEvents(eventName, basicTokenContract)
}

module.exports = {
  processPastBridgeMappingEvents
}
