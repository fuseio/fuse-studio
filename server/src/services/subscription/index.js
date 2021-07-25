const config = require('config')

const service = require(`./${config.get('subscriptionServices.fuse.transport')}`)

module.exports = service
