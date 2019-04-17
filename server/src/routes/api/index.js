const router = require('express').Router()

router.use('/metadata', require('./metadata'))
router.use('/images', require('./images'))
router.use('/receipts', require('./receipts'))
router.use('/stats', require('./stats'))
router.use('/tokenlist', require('./tokenList'))
router.use('/users', require('./users'))
router.use('/tokens', require('./tokens'))
router.use('/tokens/progress', require('./tokenProgress'))
router.use('/businesses', require('./businesses'))
router.use('/business/list', require('./businessList'))
router.use('/bridges', require('./bridges'))

router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message
        return errors
      }, {})
    })
  }
  return next(err)
})

module.exports = router
