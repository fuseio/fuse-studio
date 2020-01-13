const router = require('express').Router()
const { agenda } = require('@services/agenda')

router.post('/mint', async (req, res) => {
  // res.json({ ok: 1 })
  const job = await agenda.now('mint', req.body)
  return res.json({ job: job.attrs })
})

router.post('/burn', async (req, res) => {
  const job = await agenda.now('burn', req.body)
  return res.json({ job: job.attrs })
})

module.exports = router
