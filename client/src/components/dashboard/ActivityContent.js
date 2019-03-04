import React, { Component } from 'react'
import classNames from 'classnames'
import Moment from 'moment'
import find from 'lodash/find'
import FontAwesome from 'react-fontawesome'
import {formatWei} from 'utils/format'

const intervals = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
}

const dropdownOptions = [
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

const getLatestDataEntry = (intervalType, stats) => {
  if (!stats || !stats[0]) {
    return null
  }
  const interval = getCurrentInterval(intervalType)
  return find(stats, {interval})
}

class ActivityDropdown extends Component {
  state = {
    isOpen: false
  }

  handleDropdownClick = (item) => {
    this.setState({
      isOpen: false
    })
    this.props.handleChange(item)
  }

  handleOpenDropDown = () => this.setState({isOpen: true})

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({isOpen: false})
    }
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node
  }

  render () {
    return (
      <div ref={this.setWrapperRef} className='dashboard-information-period'>
        <span className='dashboard-information-period-text' onClick={this.handleOpenDropDown}>
          {this.props.interval.text} <FontAwesome name='caret-down' />
        </span>
        {this.state.isOpen &&
          <div className='dashboard-information-period-additional'>
            {dropdownOptions.map((item, index) =>
              <div
                className={classNames(
                  'dashboard-information-period-point',
                  this.props.interval.value === item.value ? 'active-point' : null
                )}
                key={index}
                onClick={() => this.handleDropdownClick(item)}
              >
                {item.text}
              </div>
            )}
          </div>
        }
      </div>
    )
  }
}

class ActivityContent extends Component {
  state = {
    interval: dropdownOptions[0]
  }

  componentDidMount () {
    this.props.handleChange(this.props.userType, this.state.interval.value)
  }

  handleIntervalChange = (interval) => {
    this.setState({interval})
    this.props.handleChange(this.props.userType, interval.value)
  }

  render () {
    const latestDataEntry = getLatestDataEntry(this.state.interval.value, this.props.stats)
    return (
      <div className='dashboard-information-content' >
        <div className='dashboard-information-content-activity' key='0'>
          <p className='dashboard-information-small-text'>
            <span>{this.props.title || this.props.userType}</span> Activity
          </p>
          <ActivityDropdown interval={this.state.interval} handleChange={this.handleIntervalChange} />
        </div>
        <div className='dashboard-information-content-number' key='1'>
          <p className='dashboard-information-small-text'>
            Number of transactions
          </p>
          <p className='dashboard-information-number'>
            {latestDataEntry ? latestDataEntry.totalCount : '0'}
          </p>
        </div>
        <div className='dashboard-information-content-number' key='2'>
          <p className='dashboard-information-small-text'>
            Transactions volume
          </p>
          <p className='dashboard-information-number'>
            {latestDataEntry ? formatWei(latestDataEntry.volume, 0) : '0'}
          </p>
        </div>
      </div>)
  }
}

export default ActivityContent
