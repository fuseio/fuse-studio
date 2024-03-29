const relay = require('./relay')
const wallet = require('./wallet')
const bonus = require('./bonus')
const funder = require('./funder')
const admin = require('./admin')
const bridge = require('./bridge')
const economy = require('./economy')
const apy = require('./apy')
const upgrade = require('./upgrade')

module.exports = {
  ...relay,
  ...wallet,
  ...bonus,
  ...funder,
  ...admin,
  ...bridge,
  ...economy,
  ...apy,
  ...upgrade
}
