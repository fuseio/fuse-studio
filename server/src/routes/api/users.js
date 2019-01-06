const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')

router.post('/', async (req, res) => {
  const user = new User(req.body.user)

  const results = await user.save()

  res.json({
    object: 'user',
    data: results
  })
})

module.exports = router
