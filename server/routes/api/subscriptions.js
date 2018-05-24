const request = require('request')
const mailchimpConfig = require('../../config').mailchimp

const router = require('express').Router()

router.post('/', (req, res) => {
  const mailchimpURL = mailchimpConfig.apiBase + '/lists/' + mailchimpConfig.list + '/members'
  request.post(mailchimpURL, {
    json: true,
    body: {
      email_address: req.body.formData.email,
      email_type: 'html',
      status: 'subscribed'
    }}).on('response', (response) => {
    res.send({status: 'ok'})
  })
})

module.exports = router
