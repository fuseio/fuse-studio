const router = require('express').Router()
const auth = require('@routes/auth')
const mongoose = require('mongoose')
const { toChecksumAddress } = require('web3-utils')
const { ObjectId } = mongoose.Types
const UserAccount = mongoose.model('UserAccount')
const StudioUser = mongoose.model('StudioUser')

router.get('/', auth.required, async (req, res) => {
  const { id } = req.user
  const studioUser = await StudioUser.findById(id).lean()
  const userAccounts = await UserAccount.find({ studioUser: ObjectId(id) }).lean()

  res.json({ data: { ...studioUser, userAccounts } })
})

router.post('/', auth.required, async (req, res) => {
  const { id } = req.user
  const { provider } = req.body
  const accountAddress = toChecksumAddress(req.body.accountAddress)
  let userAccount = await UserAccount.findOne({ accountAddress: toChecksumAddress(accountAddress) })

  if (!userAccount) {
    userAccount = await UserAccount({
      provider,
      accountAddress,
      studioUser: ObjectId(id)
    }).save()
  }

  res.json({ data: userAccount })
})

module.exports = router
