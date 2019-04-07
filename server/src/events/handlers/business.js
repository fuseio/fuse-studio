const businessListDeployed = require('@utils/tokenProgress').businessListDeployed
const getMetadata = require('@utils/metadata').getMetadata
const mongoose = require('mongoose')
const Business = mongoose.model('Business')
const BusinessList = mongoose.model('BusinessList')
const Bridge = mongoose.model('Bridge')

const handleEntityAddedEvent = async (event) => {
  const hash = event.returnValues.hash
  const listAddress = event.address
  const metadata = await getMetadata(hash)
  const {name} = metadata.data
  const {active} = metadata.data
  return new Business({
    hash,
    listAddress,
    name,
    active
  }).save()
}

const handleEntityReplacedEvent = async (event) => {
  const oldHash = event.returnValues.oldHash
  await Business.findOneAndDelete({hash: oldHash})

  const hash = event.returnValues.newHash
  const listAddress = event.address
  const metadata = await getMetadata(hash)
  const {name} = metadata.data
  const {active} = metadata.data
  return new Business({
    hash,
    listAddress,
    name,
    active
  }).save()
}

const handleSimpleListCreatedEvent = async (event) => {
  const listAddress = event.returnValues.list
  const homeTokenAddress = event.returnValues.token
  const admin = event.returnValues.admin

  const bridge = await Bridge.findOne({homeTokenAddress}).lean()
  const tokenAddress = bridge.foreignTokenAddress

  await new BusinessList({
    listAddress,
    tokenAddress,
    homeTokenAddress,
    admin
  }).save()

  return businessListDeployed(tokenAddress)
}

module.exports = {
  handleEntityAddedEvent,
  handleEntityReplacedEvent,
  handleSimpleListCreatedEvent
}
