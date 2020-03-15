const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

router.post('/', auth.required, async (req, res) => {
  const { appName, identifier } = req.user
  try {
    const job = await agenda.now('relay', { ...req.body, identifier, appName })
    return res.json({ job: job.attrs })
  } catch (err) {
    return res.status(400).send({ error: err })
  }
})

module.exports = router
