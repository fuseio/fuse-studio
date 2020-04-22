const router = require('express').Router()

router.use('/bridgedTokens', require('./bridgedTokens'))

module.exports = router
