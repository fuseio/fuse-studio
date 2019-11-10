const deployment = require('./deployment')
const events = require('./events')
const transfers = require('./transfers')
const wallet = require('./wallet')

module.exports = {
  ...events,
  ...deployment,
  ...transfers,
  ...wallet
}
