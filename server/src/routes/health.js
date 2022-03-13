var router = require('express').Router()

router.get('/health', (req, res, next) => {
  res.send({ response: 'ok' })
})

router.get('/is_running', (req, res, next) => {
  res.send({ response: 'ok' })
})

module.exports = router
