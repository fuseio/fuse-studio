const mongoose = require('mongoose')
const router = require('express').Router()
const sendgridUtils = require('@utils/sendgrid')

const User = mongoose.model('User')

router.post('/', async (req, res) => {
  const user = new User(req.body.user)

  const results = await user.save()

  // TODO: waiting for email templates
  // sendgridUtils.sendWelcomeMail(user)

  if (user.subscribe) {
    sendgridUtils.subscribeUser(user)
  }

  res.json({
    object: 'user',
    data: results
  })
})

module.exports = router
