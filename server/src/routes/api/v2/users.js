const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const { subscribeUser, notifyManagers} = require('@utils/sendgrid')

router.post('/', async (req, res) => {
  const user = await new User(req.body).save()

  if (req.body.subscribe) {
    subscribeUser(user)
  }

  if (req.body.source === 'studio') {
    console.log('notify managers')
    // sendgridUtils.notifyManagers({ communityName: formData.communityName, networkType: config.get('network.foreign.name') })

  }

  res.json({
    data: user
  })
})

router.post('/getnames', async (req, res) => {
  const users = await User.find({ accountAddress: req.body.accounts }, { displayName: 1, accountAddress: 1 })
  res.json({
    data: users
  })
})

module.exports = router
