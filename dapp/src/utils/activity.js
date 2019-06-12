import Moment from 'moment'
import find from 'lodash/find'

export const intervals = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
}

export const dropdownOptions = [
  {
    text: 'Monthly',
    value: intervals.MONTH
  },
  {
    text: 'Weekly',
    value: intervals.WEEK
  },
  {
    text: 'Daily',
    value: intervals.DAY
  }
]

const getCurrentInterval = (intervalType) => {
  const date = new Date()
  switch (intervalType) {
    case intervals.DAY:
      return Moment(date).date()
    case intervals.WEEK:
      return Moment(date).week()
    case intervals.MONTH:
      // mongodb numbers month from 1 to 12 while moment from 0 to 11
      return Moment(date).month() + 1
  }
}

export const getLatestDataEntry = (intervalType, stats) => {
  if (!stats || !stats[0]) {
    return null
  }
  const interval = getCurrentInterval(intervalType)
  return find(stats, { interval })
}
