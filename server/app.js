const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const errorhandler = require('errorhandler')
const morgan = require('morgan')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require('path')
const config = require('./config')
require('express-async-errors')

var isProduction = process.env.NODE_ENV === 'production'

// Create global app object
var app = express()

app.use(cors())

// Normal express config defaults
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(methodOverride())
app.use(express.static(path.join(__dirname, 'public')))

if (!isProduction) {
  app.use(errorhandler())
}

// cloning optios object cause mongoose is filling it with data about the connection
mongoose.connect(config.mongo.uri, {...config.mongo.options})

if (!isProduction) {
  mongoose.set('debug', true)
}

require('./models')

app.use(require('./routes'))

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack)

    res.status(err.status || 500)

    res.json({'errors': {
      message: err.message,
      error: err
    }})
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.json({'errors': {
    message: err.message,
    error: {}
  }})
})

// finally, let's start our server...
var server = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port)
})
