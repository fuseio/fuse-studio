const mongoose = require('mongoose')
const web3 = require('@services/web3')

require('../models')(mongoose)

const utils = {}

const event = mongoose.event

utils.getLastBlockNumber = async (conditions) => {
  const lastEvent = await event.getLastEvent(conditions)
  return lastEvent ? lastEvent.blockNumber + 1 : 0
}

utils.addNewEvent = async (data) => {
  const block = await web3.eth.getBlock(data.blockNumber)
  const timestamp = block.timestamp * 1000
  return event.create({...data, timestamp})
}

module.exports = utils
