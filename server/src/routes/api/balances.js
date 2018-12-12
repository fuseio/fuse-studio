const router = require('express').Router()
const mongoose = require('mongoose')
const Event = mongoose.model('Event')

router.get('/:account', async (req, res, next) => {
  const account = req.params.account

  const tokens = await Event.aggregate([
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
    },
    {
      $project: {
        address: '$_id',
        _id: 0
      }
    }
  ])

  res.json({
    object: 'list',
    data: tokens
  })
})

module.exports = router
