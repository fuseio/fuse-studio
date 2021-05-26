const router = require('express').Router()
const mongoose = require('mongoose')
const Deposit = mongoose.model('Deposit')
const { retryDeposit } = require('@utils/deposit')
const auth = require('@routes/auth')

router.use('/ramp', require('./ramp'))
router.use('/transak', require('./transak'))

router.post('/retry/:depositId', async (req, res) => {
  const { depositId } = req.params
  const job = await retryDeposit({ depositId })
  return res.json({ data: job })
})

router.get('/failed', auth.admin, async (req, res) => {
  const deposits = await Deposit.find({ status: 'failed' })
  return res.json({ data: deposits })
})

module.exports = router
