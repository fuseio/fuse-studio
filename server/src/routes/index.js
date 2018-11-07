var router = require('express').Router()

router.use('/api/v1', require('./api'))

router.get('/is_running', (req, res, next) => {
  res.send({response: 'ok'})
})

module.exports = router
