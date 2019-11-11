const router = require('express').Router()

router.use('/login', require('./login'))
router.use('/wallets', require('./wallets'))

module.exports = router
