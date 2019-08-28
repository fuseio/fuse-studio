require('module-alias/register')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const path = require('path')
const paginate = require('express-paginate')
const process = require('process')
const util = require('util')
const config = require('config')
const initSecrets = require('@utils/awsSecrets')
require('express-async-errors')

async function initConfig () {
  await initSecrets(config)

  config.util.makeHidden(config, 'secrets')
}

async function init () {
  await initConfig()

  console.log(util.inspect(config, { depth: null }))

  var isProduction = process.env.NODE_ENV === 'production'

  var app = express()

  if (config.get('api.allowCors')) {
    const cors = require('cors')
    app.use(cors())
  }

  app.use(morgan('common'))

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  app.use(paginate.middleware(10, 50))

  app.use(express.static(path.join(__dirname, '../public')))

  // react-router routing
  app.get('/view/*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../public', 'index.html'))
  })

  mongoose.set('debug', config.get('mongo.debug'))
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)

  mongoose.connect(config.get('mongo.uri'), config.get('mongo.options')).catch((error) => {
    console.error(error)
    process.exit(1)
  })
  require('./models')(mongoose)

  app.use(require('./routes'))

  const agenda = require('./services/agenda')
  agenda.start()

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  /// error handlers
  if (!isProduction) {
    app.use(function (err, req, res, next) {
      console.log(err.stack)

      res.status(err.status || 500)

      res.json({ 'errors': {
        message: err.message,
        error: err
      } })
    })
  } else {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500)
      res.json({ 'errors': {
        message: err.message,
        error: {}
      } })
    })
  }

  // finally, let's start our server...
  var server = app.listen(config.get('api.port') || 8080, function () {
    console.log('Listening on port ' + server.address().port)
  })
}

init()
