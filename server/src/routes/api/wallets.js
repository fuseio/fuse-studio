const router = require('express').Router()
const { agenda } = require('@services/agenda')

router.post('/', async (req, res, next) => {
  const job = await agenda.now('createWallet', req.body)
  return res.json({ job: job.attrs })
})

module.exports = router
