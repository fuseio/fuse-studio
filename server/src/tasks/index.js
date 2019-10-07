const deployment = require('./deployment')
const events = require('./events')
const transfers = require('./transfers')

module.exports = {
  ...events,
  ...deployment,
  ...transfers
}
