const communityUtils = require('../community')

const processTokenCreatedEvent = async (event) => {
  const blockNumber = event.blockNumber
  console.log(`recieved TokenCreated event at ${blockNumber} blockNumber`)
  const eventArgs = event.returnValues
  const ccAddress = eventArgs.token
  const owner = eventArgs.owner
  const factoryAddress = event.address
  const communityData = await communityUtils.getCommunityData(factoryAddress, ccAddress)

  return communityUtils.upsertCommunity({ccAddress, owner, blockNumber, ...communityData})
}

module.exports = {
  processTokenCreatedEvent
}
