import React, { Component } from 'react'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import { formatWei } from 'utils/format'
import { getLatestDataEntry, dropdownOptions } from 'utils/activity'
import { isMobileOnly } from 'react-device-detect'

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

  handleOpenDropDown = () => this.setState({ isOpen: true })

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ isOpen: false })
    }
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node
  }

  render () {
    return (
      <div ref={this.setWrapperRef} className='drop_down'>
        <span className='drop_down__text' onClick={this.handleOpenDropDown}>
          {this.props.interval.text} <FontAwesome name='caret-down' />
        </span>
        {this.state.isOpen &&
          <div className='drop_down__additional'>
            {dropdownOptions.map((item, index) =>
              <div
                className={classNames(
                  'drop_down__point',
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
    this.setState({ interval })
    this.props.handleChange(this.props.userType, interval.value)
  }

  renderMobileLayout = () => {
    const { statsToShow, userType } = this.props
    return (
      <div className={classNames('activity', { 'activity--selected': userType === statsToShow })} onClick={this.props.showStats}>
        <div className='activity__activity'>
          <p className='activity__small'>
            <span>{this.props.title || this.props.userType}</span> Activity
          </p>
          <ActivityDropdown interval={this.state.interval} handleChange={this.handleIntervalChange} />
        </div>
      </div>
    )
  }

  render () {
    const latestDataEntry = getLatestDataEntry(this.state.interval.value, this.props.stats)
    return (
      !isMobileOnly
        ? (
          <div className='activity' >
            <div className='activity__activity'>
              <p className='activity__small'>
                <span>{this.props.title || this.props.userType}</span> Activity
              </p>
              <ActivityDropdown interval={this.state.interval} handleChange={this.handleIntervalChange} />
            </div>
            <div className='activity__activity__number'>
              <p className='activity__small'>
                Number of transactions
              </p>
              <p className='activity__number'>
                {latestDataEntry ? latestDataEntry.totalCount : '0'}
              </p>
            </div>
            <div className='activity__activity__number'>
              <p className='activity__small'>
                Transactions volume
              </p>
              <p className='activity__number'>
                {latestDataEntry ? formatWei(latestDataEntry.volume, 0) : '0'}
              </p>
            </div>
          </div>
        ) : (
          this.renderMobileLayout()
        )
    )
  }
}

export default ActivityContent
