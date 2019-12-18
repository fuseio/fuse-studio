const router = require('express').Router()
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const auth = require('@routes/auth')
const UserWallet = mongoose.model('UserWallet')
const Contact = mongoose.model('Contact')
const { compact, indexOf } = require('lodash')

/**
 * @api {post} /contacts/ Sync contacts list
 * @apiName SyncContacts
 * @apiGroup Contacts
 * @apiDescription Sync contacts list
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiParam {String[]} contacts phone numbers list
 *
 * @apiSuccess {Object[]} new contacts list (phoneNumber, account)
 * @apiSuccess {Number} nonce
 */
router.post('/', auth.required, async (req, res) => {
  const { phoneNumber, accountAddress } = req.user
  const { contacts } = req.body
  const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress }).populate('contacts')
  const phoneNumbersToContacts = userWallet.contacts.reduce((map, obj) => {
    map[obj.phoneNumber] = obj
    return map
  }, {})
  const userWalletContactIds = userWallet.contacts.map(obj => obj._id)
  const userWalletContactPhoneNumbers = userWallet.contacts.map(obj => obj.phoneNumber)
  const nonce = (new Date()).getTime()

  compact(await Promise.all(contacts.map(phoneNumber => {
    return new Promise(async (resolve, reject) => {
      let contact = phoneNumbersToContacts[phoneNumber]
      if (contact && contact.state == 'SYNCED') {
        contact.state = 'NEW'
        await contact.save()
      }
      if (contact) {
        resolve()
      }

      let contactUserWallets = await UserWallet.find({ phoneNumber })
      if (contactUserWallets.length === 0) {
        let contact = await new Contact({
          userWallet: ObjectId(userWallet._id),
          phoneNumber,
          nonce
        }).save()
        userWalletContactIds.push(contact._id)
        return resolve()
      }
      await Promise.all(contactUserWallets.map(contactUserWallet => {
        return new Promise(async (resolve, reject) => {
          let contact = await new Contact({
            userWallet: ObjectId(userWallet._id),
            phoneNumber,
            walletAddress: contactUserWallet && contactUserWallet.walletAddress,
            state: contactUserWallet && contactUserWallet.walletAddress ? 'NEW' : 'EMPTY',
            nonce
          }).save()
          userWalletContactIds.push(contact._id)
          resolve()
        })
      }))
      resolve()
    })
  })))
  await UserWallet.findOneAndUpdate({ phoneNumber, accountAddress }, { contacts: userWalletContactIds })
  const newContacts = await Contact.find({ userWallet: userWallet._id, state: 'NEW' }, { _id: 0, phoneNumber: 1, walletAddress: 1 })
  res.send({ data: { newContacts, nonce } })
})

/**
 * @api {post} /contacts/:nonce Acknowledge contacts list sync with nonce
 * @apiName AckSyncContacts
 * @apiGroup Contacts
 * @apiDescription Acknowledge contacts list sync with nonce
 *
 * @apiHeader {String} Authorization JWT Authorization in a format "Bearer {jwtToken}"
 *
 * @apiSuccess {String} response Response status - ok
 */
router.post('/:nonce', auth.required, async (req, res) => {
  const { phoneNumber, accountAddress } = req.user
  const { nonce } = req.params
  const userWallet = await UserWallet.findOne({ phoneNumber, accountAddress })
  await Contact.updateMany({ userWallet: ObjectId(userWallet._id), nonce }, { state: 'SYNCED' })
  res.send({ response: 'ok' })
})

module.exports = router
