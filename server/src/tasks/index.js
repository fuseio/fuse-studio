const deployment = require('./deployment')
const events = require('./events')
const transfers = require('./transfers')
const token = require('./token')
const alert = require('./alert')
const deposit = require('./deposit')

module.exports = {
  ...events,
  ...deployment,
  ...transfers,
  ...token,
  ...alert,
  ...deposit
}
