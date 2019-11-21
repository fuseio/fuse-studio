const router = require('express').Router()
const mongoose = require('mongoose')
const Profile = mongoose.model('Profile')
const Entity = mongoose.model('Entity')
const web3Utils = require('web3-utils')

router.put('/:account', async (req, res) => {
  const { account } = req.params
  const { publicData } = req.body

  let profile
  try {
    profile = await new Profile({ account: web3Utils.toChecksumAddress(account), publicData }).save()
  } catch (error) {
    profile = await Profile.findOneAndUpdate({ account }, { publicData }, { new: true })
  }
  await Entity.updateMany({ account }, { profile: profile._id })

  return res.json({ data: profile })
})

router.get('/:accountAddress', async (req, res) => {
  const { accountAddress } = req.params
  const user = await Profile.findOne({ account: accountAddress }).lean()
  return res.json({
    userExists: !!user
  })
})

module.exports = router
