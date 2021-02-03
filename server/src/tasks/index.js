const deployment = require('./deployment')
const events = require('./events')
const actions = require('./actions')
const alert = require('./alert')
const tvl = require('./tvl')

module.exports = {
  ...events,
  ...deployment,
  ...actions,
  ...alert,
  ...tvl
}
