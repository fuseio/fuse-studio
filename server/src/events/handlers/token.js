const tokenUtils = require('@utils/token')

const handleTokenCreatedEvent = async (event) => {
  const blockNumber = event.blockNumber
  const eventArgs = event.returnValues
  const address = eventArgs.token
  const owner = eventArgs.issuer
  const factoryAddress = event.address
  const tokenData = await tokenUtils.fetchTokenData(address)

  return tokenUtils.createToken({owner, blockNumber, factoryAddress, ...tokenData})
}

const handleTransferEvent = (event) => {
  return Promise.resolve()
}

module.exports = {
  handleTokenCreatedEvent,
  handleTransferEvent
}
