const mongoose = require('mongoose')

require('../models')(mongoose)

const utils = {}

const event = mongoose.event

utils.getLastBlockNumber = async (eventName) => {
  const lastEvent = await event.getLastEvent(eventName)
  return lastEvent ? lastEvent.blockNumber + 1 : 0
}

utils.addNewEvent = async (data) => {
  return event.create(data)
}

module.exports = utils
