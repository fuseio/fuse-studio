var router = require('express').Router()

router.use('/api/v1', require('./api/v1'))
router.use('/api/v2', require('./api/v2'))

router.get('/is_running', (req, res, next) => {
  res.send({ response: 'ok' })
})

module.exports = router
