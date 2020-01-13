const router = require('express').Router()
const { agenda } = require('@services/agenda')

router.post('/mint', async (req, res) => {
  const { tokenAddress, networkType, amount, from } = req.body
  if (networkType !== 'fuse') {
    return res.status(400).send({ error: 'Supported only on Fuse Network' })
  }
  const job = await agenda.now('mint', { tokenAddress, bridgeType: 'home', from, amount })
  return res.json({ job: job.attrs })
})

router.post('/burn', async (req, res) => {
  const job = await agenda.now('burn', req.body)
  return res.json({ job: job.attrs })
})

module.exports = router
