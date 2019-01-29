const router = require('express').Router()
const mongoose = require('mongoose')
const Event = mongoose.model('Event')
const Token = mongoose.model('Token')

router.get('/:account', async (req, res, next) => {
  const account = req.params.account

  const events = await Event.aggregate([
    {
      $match: {
        eventName: 'Transfer',
        $or: [
          {'returnValues.to': account},
          {'returnValues.from': account}
        ]
      }
    },
    {
      $group: {
        _id: '$address'
      }
    }
  ])

  const addresses = events.map(ev => ev._id)
  const tokens = await Token.find({address: {$in: addresses}})

  res.json({
    object: 'list',
    data: tokens
  })
})

module.exports = router
