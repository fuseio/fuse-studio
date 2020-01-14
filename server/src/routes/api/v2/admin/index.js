const router = require('express').Router()

router.use('/tokens', require('./tokens'))

module.exports = router
