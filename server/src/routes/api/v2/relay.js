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

router.post('/multi', auth.required, async (req, res) => {
  const { appName, identifier } = req.user
  try {
    const { items } = req.body
    if (!items) {
      return res.status(400).send({ error: `No items in body` })
    }
    const firstItem = items.shift()
    const job = await agenda.now('relay', { ...firstItem, identifier, appName, nextRelays: items })
    return res.json({ job: job.attrs })
  } catch (err) {
    console.error(err)
    return res.status(400).send({ error: err })
  }
})

module.exports = router
