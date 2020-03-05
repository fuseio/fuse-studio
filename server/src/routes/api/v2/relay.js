const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

router.post('/', auth.required, async (req, res) => {
  const { appName } = req.user
  const job = await agenda.now('relay', { ...req.body, appName })
  return res.json({ job: job.attrs })
})

module.exports = router
