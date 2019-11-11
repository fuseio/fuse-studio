const router = require('express').Router()
const sendgridUtils = require('@utils/sendgrid')

router.post('/subscribe', async (req, res, next) => {
  const { user } = req.body
  sendgridUtils.subscribeUser(user)
  sendgridUtils.sendWelcomeMail(user)
  res.send({ response: 'ok' })
})

module.exports = router
