const relay = require('./relay')
const wallet = require('./wallet')
const bonus = require('./bonus')

module.exports = {
  ...relay,
  ...wallet,
  ...bonus
}
