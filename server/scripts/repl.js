require('module-alias/register')
require('../src/services/mongo').start()
global.config = require('config')

require('repl').start({
  useGlobal: true
})
