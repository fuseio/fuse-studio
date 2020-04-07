const router = require('express').Router()

router.use('/accounts', require('./accounts'))
router.use('/tokens', require('./tokens'))
router.use('/wallets', require('./wallets'))

module.exports = router
