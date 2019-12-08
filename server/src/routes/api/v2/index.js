const router = require('express').Router()

router.use('/login', require('./login'))
router.use('/relay', require('./relay'))
router.use('/users', require('./users'))
router.use('/wallets', require('./wallets'))

module.exports = router
