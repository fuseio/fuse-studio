const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const mailchimpUtils = require('@utils/mailchimp')
const auth = require('@routes/auth')

router.post('/', async (req, res) => {
  try {
    const user = await new User(req.body).save()

    if (req.body.subscribe) {
      mailchimpUtils.subscribeUser(user)
    }

    res.json({
      data: user
    })
  } catch (error) {
    console.log(error.message || error)
    res.json({
      message: error.message,
      error: error
    })
  }
})

router.put('/:accountAddress/avatar', auth.required, async (req, res) => {
  try {
    const { accountAddress } = req.params
    const { avatarHash } = req.body
    const user = await User.findOneAndUpdate({ accountAddress }, { avatarHash })
    res.send({ data: user })
  } catch (error) {
    console.log(error.message || error)
    res.json({
      message: error.message,
      error: error
    })
  }
})

router.put('/:accountAddress/name', auth.required, async (req, res) => {
  try {
    const { accountAddress } = req.params
    const { displayName } = req.body
    const user = await User.findOneAndUpdate({ accountAddress }, { displayName })
    res.send({ data: user })
  } catch (error) {
    console.log(error.message || error)
    res.json({
      message: error.message,
      error: error
    })
  }
})

router.post('/getnames', async (req, res) => {
  const users = await User.find({ accountAddress: req.body.accounts }, { displayName: 1, accountAddress: 1 })
  res.json({
    data: users
  })
})

module.exports = router
