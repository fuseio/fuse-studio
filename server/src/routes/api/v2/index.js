const router = require('express').Router()

router.use('/login', require('./login'))
router.use('/relay', require('./relay'))
router.use('/users', require('./users'))
router.use('/wallets', require('./wallets'))
router.use('/jobs', require('./jobs'))
router.use('/contacts', require('./contacts'))
router.use('/admin', require('./admin'))
router.use('/accounts', require('./accounts'))

module.exports = router
