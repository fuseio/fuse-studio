const tokenUtils = require('@utils/token')

const tokenTypeEnumToString = {
  0: 'basic',
  1: 'mintableBurnable'
}

const handleTokenCreatedEvent = async (event) => {
  const eventArgs = event.returnValues
  const address = eventArgs.token

  const tokenData = {
    address,
    factoryAddress: event.address,
    blockNumber: event.blockNumber,
    owner: eventArgs.issuer,
    tokenType: tokenTypeEnumToString[eventArgs.tokenType]
  }

  const fetchedTokenData = await tokenUtils.fetchTokenData(address)

  return tokenUtils.createToken({...tokenData, ...fetchedTokenData})
}

const handleTransferEvent = (event) => {
  return Promise.resolve()
}

module.exports = {
  handleTokenCreatedEvent,
  handleTransferEvent
}
