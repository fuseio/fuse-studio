const router = require('express').Router()
const { agenda } = require('@services/agenda')
const auth = require('@routes/auth')

router.post('/', auth.required, async (req, res) => {
  await agenda.now('relay', req.body)
  return res.json({ response: 'ok' })
})

module.exports = router
