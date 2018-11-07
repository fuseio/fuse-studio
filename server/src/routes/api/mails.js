const mandrill = require('mandrill-api/mandrill')
const config = require('config')

const mandrillConfig = config.get('mandrill')

const router = require('express').Router()
const mandrillClient = new mandrill.Mandrill(mandrillConfig.apiKey)

const message = {
  'merge_language': 'handlebars',
  'to': [{
    'email': mandrillConfig.sendTo,
    'name': 'Recipient Name',
    'type': 'to'
  }]
}

router.post('/', (req, res) => {
  mandrillClient.messages.sendTemplate({
    'template_name': 'cln-app-contact-us',
    'template_content': [],
    'message': {
      ...message,
      'subject': req.body.formData.subject,
      'from_name': req.body.formData.fullName,
      'global_merge_vars': Object.keys(req.body.formData).map(key => ({
        name: key,
        content: req.body.formData[key]
      }))
    },
    'send_at': new Date()
  }, result => {
    res.send({status: result})
  })
})

module.exports = router
