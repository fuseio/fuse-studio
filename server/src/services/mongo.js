const process = require('process')
const mongoose = require('mongoose')

function start () {
  const config = require('config')

  mongoose.set('debug', config.get('mongo.debug'))
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)

  mongoose.connect(config.get('mongo.uri'), config.get('mongo.options')).catch((error) => {
    console.error(error)
    process.exit(1)
  })
  require('../models')(mongoose)
}

module.exports = {
  start
}
