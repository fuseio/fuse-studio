const router = require('express').Router()
const mongoose = require('mongoose')
const Event = mongoose.model('Event')
const communityModel = mongoose.community

router.get('/:activityType/:address', async (req, res, next) => {
  const activityType = req.params.activityType
  const tokenAddress = req.params.address

  const interval = req.query.interval || 'month'
  if (interval !== 'month' && interval !== 'week') {
    throw Error('Bad interval parameter, correct values for interval is "month" or "week"')
  }

  if (activityType !== 'user' && activityType !== 'admin') {
    throw Error('Bad activityType parameter, correct values for activityType is "user" or "admin"')
  }

  const community = await communityModel.getByccAddress(tokenAddress)
  const {owner} = community

  const $match = {
    eventName: 'Transfer',
    address: tokenAddress
  }

  if (activityType === 'user') {
    $match['user'] = {
      $ne: [
        {'returnValues.to': owner},
        {'returnValues.from': owner}
      ]
    }
  } else {
    $match['$or'] = [
      {'returnValues.to': owner},
      {'returnValues.from': owner}
    ]
  }

  const stats = await Event.aggregate([
    {
      $match
    },
    {
      $group: {
        _id: {[interval]: {[`$${interval}`]: '$timestamp'}},
        totalCount: {$sum: 1},
        volume: {$sum: {$toDecimal: '$returnValues.value'}}
      }
    },
    {
      $project: {
        volume: {$toString: '$volume'},
        totalCount: 1
      }
    }
  ])

  return res.json({
    object: 'list',
    data: stats
  })
})

module.exports = router
