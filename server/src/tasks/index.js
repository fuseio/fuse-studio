const deployment = require('./deployment')
const events = require('./events')

module.exports = {
  ...events,
  ...deployment
}
