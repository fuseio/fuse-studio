const deployment = require('./deployment')
const events = require('./events')
const relay = require('./relay')
const transfers = require('./transfers')
const wallet = require('./wallet')
const token = require('./token')
const bonus = require('./bonus')
const alert = require('./alert')
const deposit = require('./deposit')
const ethFunder = require('./eth_funder')

module.exports = {
  ...events,
  ...deployment,
  ...relay,
  ...transfers,
  ...wallet,
  ...token,
  ...bonus,
  ...alert,
  ...deposit,
  ...ethFunder
}
