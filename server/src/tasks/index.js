const deployment = require('./deployment')
const events = require('./events')
const actions = require('./actions')
const alert = require('./alert')
const wallets = require('./wallets')
const tvl = require('./tvl')

module.exports = {
  ...events,
  ...deployment,
  ...actions,
  ...alert,
  ...wallets,
  ...tvl
}
