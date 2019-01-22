import React, { Component } from 'react'
import ProfileIcon from 'images/user-dashboard.svg'
import EntityHeader from 'images/entity_logo.png'
import {BigNumber} from 'bignumber.js'
import classNames from 'classnames'
import ReactGA from 'services/ga'

class Header extends Component {
  showDashboard = (address) => {
    this.props.history.push(`/view/dashboard/${address}`)
    ReactGA.event({
      category: 'Dashboard',
      action: 'Click',
      label: 'dashboard'
    })
  }
  showDirectory = (address) => {
    this.props.history.push(`/view/directory/${address}`)
    ReactGA.event({
      category: 'Directory',
      action: 'Click',
      label: 'directory'
    })
  }

  render () {
    const link = this.props.match.path.split('/')
    const activeDashboardLinkClass = classNames({
      'entities-header-nav-link': true,
      'active-link': link[2] === 'dashboard'
    })
    const activeDirectoryLinkClass = classNames({
      'entities-header-nav-link': true,
      'active-link': link[2] === 'directory'
    })
    return (
      <div className='entities-header'>
        <div className='entities-header-content'>
          <div className='entities-logo' onClick={() => this.props.showHomePage()}>
            <img src={EntityHeader} />
            fuse
          </div>
          <div className='entities-header-nav'>
            <span onClick={() => this.showDashboard(this.props.match.params.address)} className={activeDashboardLinkClass}>Dashboard</span>
            <span onClick={() => this.showDirectory(this.props.match.params.address)} className={activeDirectoryLinkClass}>Business</span>
          </div>
        </div>
        <div className='entities-header-profile'>
          <span className='profile-icon'>
            <img src={ProfileIcon} />
          </span>
          <span className='profile-balance'>
            <span className='balance-address'>{this.props.accountAddress || 'Connect Metamask'}</span>
            {(this.props.clnBalance)
              ? <div className='top-nav-balance'>
                <span className='balance-text'>Balance:</span>
                <span className='balance-number'>{new BigNumber(this.props.clnBalance).div(1e18).toFormat(2, 1)}</span>
              </div>
              : null}
          </span>
        </div>
      </div>
    )
  }
}

export default Header
