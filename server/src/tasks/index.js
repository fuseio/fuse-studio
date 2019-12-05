const deployment = require('./deployment')
const events = require('./events')
const relay = require('./relay')
const transfers = require('./transfers')
const wallet = require('./wallet')

module.exports = {
  ...events,
  ...deployment,
  ...relay,
  ...transfers,
  ...wallet
}
