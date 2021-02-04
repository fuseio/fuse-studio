const relay = require('./relay')
const wallet = require('./wallet')
const bonus = require('./bonus')
const ethFunder = require('./ethFunder')
const admin = require('./admin')
const bridge = require('./bridge')
const economy = require('./economy')

module.exports = {
  ...relay,
  ...wallet,
  ...bonus,
  ...ethFunder,
  ...admin,
  ...bridge,
  ...economy
}
