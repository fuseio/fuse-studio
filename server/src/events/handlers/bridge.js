const mongoose = require('mongoose')
const Bridge = mongoose.model('Bridge')

const handleBridgeMappingUpdatedEvent = async (event) => {
  const foreignTokenAddress = event.returnValues.foreignToken
  const homeTokenAddress = event.returnValues.homeToken
  const foreignBridgeAddress = event.returnValues.foreignBridge
  const homeBridgeAddress = event.returnValues.homeBridge
  const foreignBridgeBlockNumber = event.returnValues.foreignStartBlock
  const homeBridgeBlockNumber = event.returnValues.homeStartBlock

  return new Bridge({
    foreignTokenAddress,
    homeTokenAddress,
    foreignBridgeAddress,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber
  }).save()
}

module.exports = {
  handleBridgeMappingUpdatedEvent
}
