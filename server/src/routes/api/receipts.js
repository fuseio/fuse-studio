const router = require('express').Router()
const handleReceipt = require('@events/handlers').handleReceipt

router.post('/', async (req, res, next) => {
  const { receipt } = req.body
  await handleReceipt(receipt)
  return res.json({})
})

module.exports = router
