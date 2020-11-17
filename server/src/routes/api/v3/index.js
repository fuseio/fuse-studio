const router = require('express').Router()

router.use('/relay', require('./relay'))
router.use('/wallets', require('./wallets'))
router.use('/jobs', require('./jobs'))
module.exports = router
