const router = require('express').Router()

router.use('/tokens', require('./tokens'))
router.use('/wallets', require('./wallets'))

module.exports = router
