const router = require('express').Router()
const config = require('config')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const wallet = fromMasterSeed(config.get('secrets.accounts.seed'))
const mongoose = require('mongoose')
const Account = mongoose.model('Account')

// TODO add auth.required
router.post('/createCommunityAdmin', async (req, res) => {
  const { childIndex } = await Account.findOne({}, { childIndex: 1 }).sort({ childIndex: -1 })
  const newAccountChildIndex = childIndex + 1
  const newAccountAddress = wallet.deriveChild(newAccountChildIndex).getWallet().getAddressString()
  const account = await new Account({
    address: newAccountAddress,
    childIndex: newAccountChildIndex,
    nonces: {
      home: 0,
      foreign: 0
    },
    role: 'communityAdmin'
  }).save()
  res.send({ account })
})

module.exports = router
