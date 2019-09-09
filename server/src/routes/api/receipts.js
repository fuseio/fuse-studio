const router = require('express').Router()
const { handleReceipt, handleTransactionHash } = require('@events/handlers')

router.post('/', async (req, res, next) => {
  const { receipt } = req.body
  await handleReceipt(receipt, true)
  return res.json({})
})

router.post('/:transactionHash', async (req, res, next) => {
  const { abiName, bridgeType } = req.body
  const { transactionHash } = req.params
  await handleTransactionHash({ transactionHash, abiName, bridgeType })
  return res.json({})
})

module.exports = router
