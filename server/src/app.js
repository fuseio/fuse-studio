require('module-alias/register')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const paginate = require('express-paginate')
const util = require('util')
const config = require('config')
const mongo = require('./services/mongo')
const initSecrets = require('@utils/awsSecrets')
require('express-async-errors')
const requestIp = require('request-ip')

async function initConfig () {
  await initSecrets(config)

  config.util.makeHidden(config, 'secrets')
}

async function init () {
  await initConfig()

  console.log(util.inspect(config, { depth: null }))

  var app = express()

  if (config.get('api.allowCors')) {
    const cors = require('cors')
    app.use(cors())
  }

  app.use(morgan('common'))

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.use(paginate.middleware(10, 50))

  app.use(requestIp.mw())

  app.use(express.static(path.join(__dirname, '../public')))

  // react-router routing
  app.get('/view/*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../public', 'index.html'))
  })

  mongo.start()

  app.use(require('./routes'))

  const agenda = require('./services/agenda')
  agenda.start()

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  /// error handler
  app.use(function (err, req, res, next) {
    console.error(err.stack)

    res.status(err.status || 500)

    res.json({ 'errors': {
      message: err.message,
      error: err
    } })
  })

  // finally, let's start our server...
  var server = app.listen(config.get('api.port') || 8080, function () {
    console.log('Listening on port ' + server.address().port)
  })
}

init()
