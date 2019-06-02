const mongoose = require('mongoose')
const Token = mongoose.model('Token')
const Bridge = mongoose.model('Bridge')
const config = require('config')
const tokenUtils = require('@utils/token')
const { web3 } = require('@services/web3/home')

const handleBridgeMappingUpdatedEvent = async (event) => {
  const foreignTokenAddress = event.returnValues.foreignToken
  const homeTokenAddress = event.returnValues.homeToken
  const foreignBridgeAddress = event.returnValues.foreignBridge
  const homeBridgeAddress = event.returnValues.homeBridge
  const foreignBridgeBlockNumber = event.returnValues.foreignStartBlock
  const homeBridgeBlockNumber = event.returnValues.homeStartBlock

  // TODO
  // temporal fix: add tokenURI to the contract on Fuse
  const { tokenURI } = await Token.findOne({ address: foreignTokenAddress }, { tokenURI: 1 })
  await Token.findOneAndUpdate({ address: homeTokenAddress }, { tokenURI })

  return new Bridge({
    foreignTokenAddress,
    homeTokenAddress,
    foreignBridgeAddress,
    homeBridgeAddress,
    foreignBridgeBlockNumber,
    homeBridgeBlockNumber
  }).save()
}

const handleHomeBridgeDeployed = async (event, receipt) => {
  const eventArgs = event.returnValues
  const address = eventArgs._token

  const tokenData = {
    address,
    factoryAddress: event.address,
    blockNumber: event.blockNumber,
    tokenType: 'basic',
    networkType: config.get('network.home.name')
  }

  const fetchedTokenData = await tokenUtils.fetchTokenData(address, { tokenURI: false }, web3)

  return new Token({
    ...tokenData,
    ...fetchedTokenData
  }).save()
}

module.exports = {
  handleBridgeMappingUpdatedEvent,
  handleHomeBridgeDeployed
}
