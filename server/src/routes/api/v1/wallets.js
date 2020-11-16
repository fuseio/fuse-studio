const router = require('express').Router()
const { agenda } = require('@services/agenda')
const queue = require('@services/queue')

router.post('/', async (req, res, next) => {
  // const job = await agenda.now('createWallet', req.body)
  const job = await queue.sendMessage({
    name: 'createWallet',
    params: req.body
  })
  return res.json({ job: job })
})

module.exports = router
