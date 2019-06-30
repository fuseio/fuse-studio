const mongoose = require('mongoose')
require('../models')(mongoose)

const utils = {}

const event = mongoose.event

utils.getLastBlockNumber = async (conditions) => {
  const lastEvent = await event.getLastEvent(conditions)
  return lastEvent ? lastEvent.blockNumber + 1 : 0
}

module.exports = utils
