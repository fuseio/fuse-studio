const router = require('express').Router()

router.use('/bridgedTokens', require('./bridgedTokens'))
router.use('/communities', require('./communities'))

module.exports = router
