const mongoose = require('mongoose')
const router = require('express').Router()
const sendgridUtils = require('@utils/sendgrid')
const sigUtil = require('eth-sig-util')
const config = require('config')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const auth = require('@routes/auth')
const User = mongoose.model('User')
const generateSignatureData = require('@utils/auth').generateSignatureData

router.post('/', auth.required, async (req, res) => {
  const user = new User(req.body.user)

  const results = await user.save()

  // TODO: waiting for email templates
  // sendgridUtils.sendWelcomeMail(user)

  if (user.subscribe) {
    sendgridUtils.subscribeUser(user)
  }

  res.json({
    object: 'user',
    data: results
  })
})

router.post('/verify', auth.required, async (req, res) => {
  const {accountAddress} = req.user
  if (req.user.accountAddress !== req.body.user.accountAddress) {
    return res.status(404).json({error: 'The session token does not match the account'})
  }

  const result = await User.findOneAndUpdate({accountAddress}, {verified: true})
  if (result) {
    return res.json({message: 'account verified'})
  } else {
    return res.status(404).json({error: 'Bad account'})
  }
})

const validateDate = (req, res, next) => {
  const {date} = req.body

  const signatureDate = moment(date)
  if (!signatureDate.isValid()) {
    return res.status(400).json({
      error: 'Bad date supplied'
    })
  }

  const now = moment()
  if (now.diff(signatureDate, 'minutes') > 5 || now.diff(signatureDate, 'minutes') < 0) {
    return res.status(400).json({
      error: 'Bad date supplied'
    })
  }
  next()
}
router.post('/login/:accountAddress', validateDate, async (req, res) => {
  const {signature, date} = req.body
  const {accountAddress} = req.params

  const recoveredAccount = sigUtil.recoverTypedSignature({
    data: generateSignatureData({accountAddress, date}),
    sig: signature
  })

  if (recoveredAccount !== accountAddress.toLowerCase()) {
    return res.status(400).json({
      error: 'Bad signature supplied'
    })
  }

  const secret = config.get('api.secret')
  const expiresIn = config.get('api.tokenExpiresIn')

  const token = jwt.sign({ accountAddress }, secret, {
    expiresIn
  })

  res.json({token})
})

module.exports = router
