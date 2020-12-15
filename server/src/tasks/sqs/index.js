const relay = require('./relay')
const wallet = require('./wallet')
const bonus = require('./bonus')
const ethFunder = require('./ethFunder')
const admin = require('./admin')

module.exports = {
  ...relay,
  ...wallet,
  ...bonus,
  ...ethFunder,
  ...admin
}
