const router = require('express').Router()

router.use('/relay', require('./relay'))
router.use('/wallets', require('./wallets'))
router.use('/jobs', require('./jobs'))
router.use('/fund', require('./fund'))

module.exports = router
