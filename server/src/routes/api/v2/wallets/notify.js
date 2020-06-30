
const router = require('express').Router()
const { processTransaction } = require('@utils/wallet')

router.post('/', async (req, res) => {
  const source = req.body.source || 'blocknative'
  await processTransaction({ ...req.body, source })

  return res.send({ msg: 'success' })
})

module.exports = router
