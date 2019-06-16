const deployment = require('./deployment')
const events = require('./deployment')

module.exports = {
  ...events,
  ...deployment
}
