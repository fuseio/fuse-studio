const router = require('express').Router()
const { agenda } = require('@services/agenda')

router.post('/:accountAddress', async (req, res, next) => {
  const { accountAddress } = req.params
  const job = await agenda.now('ethFunder', { accountAddress })
  return res.json({ job: job.attrs })
})

module.exports = router
