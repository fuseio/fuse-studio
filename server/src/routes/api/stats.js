const router = require('express').Router()
const mongoose = require('mongoose')
const Moment = require('moment')
const Event = mongoose.model('Event')
const communityModel = mongoose.community

const intervals = {
  month: 'month',
  week: 'isoWeek',
  day: 'dayOfMonth'
}

const genInterval = (query) => {
  const interval = query.interval || 'month'
  if (!intervals.hasOwnProperty(interval)) {
    throw Error(`Bad interval parameter, correct values for interval is ${Object.keys(intervals).toString().replace(/,/g, ', ')}`)
  }
  return intervals[interval]
}

const getMinimumTimestamp = (interval) => {
  switch (interval) {
    case intervals.month:
      return new Moment().startOf('year').toDate()
    case intervals.week:
      return new Moment().startOf('year').toDate()
    case intervals.day:
      return new Moment().startOf('month').toDate()
  }
}

router.get('/:activityType/:address', async (req, res, next) => {
  const activityType = req.params.activityType
  const tokenAddress = req.params.address

  if (activityType !== 'user' && activityType !== 'admin') {
    throw Error('Bad activityType parameter, correct values for activityType is "user" or "admin"')
  }

  const interval = genInterval(req.query)
  const community = await communityModel.getByccAddress(tokenAddress)
  const {owner} = community

  const $match = {
    eventName: 'Transfer',
    address: tokenAddress,
    timestamp: {
      $gte: getMinimumTimestamp(interval)
    }
  }

  if (activityType === 'user') {
    $match.$and = [
      {'returnValues.from': {$ne: community.factoryAddress}},
      {'returnValues.from': {$ne: owner}},
      {'returnValues.to': {$ne: community.factoryAddress}},
      {'returnValues.to': {$ne: owner}}
    ]
  } else {
    $match.$or = [
      {
        'returnValues.from': owner
      },
      {
        'returnValues.from': community.factoryAddress,
        'returnValues.to': owner
      },
      {
        'returnValues.from': community.mmAddress,
        'returnValues.to': owner
      }
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
        totalCount: 1,
        interval: `$_id.${interval}`
      }
    },
    {
      $sort: {
        interval: -1
      }
    }
  ])

  return res.json({
    object: 'list',
    data: stats
  })
})

module.exports = router
