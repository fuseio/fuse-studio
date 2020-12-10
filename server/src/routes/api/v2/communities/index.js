const router = require('express').Router()

router.use('/accounting', require('./accounting'))

module.exports = router
