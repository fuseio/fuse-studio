const router = require('express').Router()
const auth = require('@routes/auth')
const { countTransactions, calculateExpenses, availableBalance } = require('@utils/community/accounting')

router.get('/count/:communityAddress', auth.required, async (req, res, next) => {
  const { communityAddress } = req.params
  const { txCount } = await countTransactions(communityAddress)
  res.json({ data: { txCount, communityAddress } })
})

router.get('/expenses/:communityAddress', auth.required, async (req, res, next) => {
  const { communityAddress } = req.params
  const { expenses } = await calculateExpenses(communityAddress)
  res.json({ data: { expenses, communityAddress } })
})

router.get('/balance/:communityAddress', auth.required, async (req, res, next) => {
  const { communityAddress } = req.params
  const { balance } = await availableBalance(communityAddress)
  res.json({ data: { balance, communityAddress } })
})

module.exports = router
