const router = require('express').Router()

router.post('/moonpay', async (req, res) => {
  console.log(req.body)
  return res.json({})
})

module.exports = router
