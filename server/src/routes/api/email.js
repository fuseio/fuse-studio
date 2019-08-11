const router = require('express').Router()
const sendgridUtils = require('@utils/sendgrid')

router.post('/subscribe', async (req, res, next) => {
  const { user } = req.body
  await sendgridUtils.subscribeUser(user)
  res.send({ response: 'ok' })
})

module.exports = router
