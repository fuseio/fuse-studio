const router = require('express').Router()

router.use('/login', require('./login'))
router.use('/users', require('./users'))
router.use('/wallets', require('./wallets'))

module.exports = router
