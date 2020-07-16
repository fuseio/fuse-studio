const router = require('express').Router()
const sendgridUtils = require('@utils/sendgrid')
const mailchimpUtils = require('@utils/mailchimp')

router.post('/subscribe', async (req, res, next) => {
  const { user } = req.body
  mailchimpUtils.subscribeUser(user)
  sendgridUtils.sendWelcomeMail(user)
  res.send({ response: 'ok' })
})

module.exports = router
