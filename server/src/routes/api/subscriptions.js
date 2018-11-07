const request = require('request')
const config = require('config')

const mailchimpConfig = config.get('mailchimp')

const router = require('express').Router()

router.post('/', (req, res, next) => {
  const mailchimpURL = mailchimpConfig.apiBase + '/lists/' + mailchimpConfig.list + '/members'
  request.post(mailchimpURL, {
    json: true,
    body: {
      email_address: req.body.formData.email,
      email_type: 'html',
      status: 'subscribed',
      merge_fields: {
        'SOURCE': 'dapp'
      }
    }
  }, (error, response, body) => {
    if (error) {
      return next(error)
    }

    if (body.status >= 400) {
      return next(body)
    }

    if (response.statusCode >= 400) {
      return next(new Error(`failed to subscribe ${req.body.formData.email}`))
    }

    res.send({status: 'ok'})
  })
})

module.exports = router
