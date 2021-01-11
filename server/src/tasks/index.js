const deployment = require('./deployment')
const events = require('./events')
const transfers = require('./transfers')
const alert = require('./alert')
const deposit = require('./deposit')
const wallets = require('./wallets')
const tvl = require('./tvl')

module.exports = {
  ...events,
  ...deployment,
  ...transfers,
  ...alert,
  ...deposit,
  ...wallets,
  ...tvl
}
