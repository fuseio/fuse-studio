const router = require('express').Router()
const mongoose = require('mongoose')
const Profile = mongoose.model('Profile')
const Entity = mongoose.model('Entity')

router.put('/:account', async (req, res) => {
  const { account } = req.params
  const { publicData } = req.body

  let profile
  try {
    profile = await new Profile({ account, publicData }).save()
    await Entity.findOneAndUpdate({ account }, { profile: profile._id })
  } catch (error) {
    profile = Profile.findOneAndUpdate({ account }, { publicData }, { new: true })
  }

  return res.json({ data: profile })
})

module.exports = router
