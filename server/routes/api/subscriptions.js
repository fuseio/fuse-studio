const request = require('request')
const mailchimpConfig = require('../../config').mailchimp

const router = require('express').Router()

router.post('/', (req, res, next) => {
  const mailchimpURL = mailchimpConfig.apiBase + '/lists/' + mailchimpConfig.list + '/members'
  request.post(mailchimpURL, {
    json: true,
    body: {
      email_address: req.body.formData.email,
      email_type: 'html',
      status: 'subscribed'
    }}).on('response', (response) => {
      if (response.statusCode < 400) {
        res.send({status: response.statusCode})
      } else {
        next(new Error(`failed to subscribe ${req.body.formData.email}`))
      }
  }).on('error', (error) => {
    next(error)
  })
})

module.exports = router
