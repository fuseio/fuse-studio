const router = require('express').Router()
const taskManager = require('@services/taskManager')
const auth = require('@routes/auth')

router.post('/', auth.required, async (req, res) => {
  const { appName, identifier } = req.user
  try {
    const job = await taskManager.now('relay', { ...req.body, identifier, appName }, { isWalletJob: true })
    return res.json({ job })
  } catch (err) {
    return res.status(400).send({ error: err.message })
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
    const job = await taskManager.now('relay', { ...firstItem, identifier, appName, nextRelays: items })
    return res.json({ job })
  } catch (err) {
    console.error(err)
    return res.status(400).send({ error: err.message })
  }
})

module.exports = router
