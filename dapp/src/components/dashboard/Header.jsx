import React, { Component } from 'react'
import { connect } from 'react-redux'
import ProfileIcon from 'images/user-dashboard.svg'
import Logo from 'components/Logo'
import { getEntities } from 'selectors/entities'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import ReactGA from 'services/ga'
import FontAwesome from 'react-fontawesome'

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
    const hashes = this.props.history.location.pathname.split('/')
    const link = this.props.match.path.split('/')
    const keyHash = Object.keys(this.props.listHashes).filter(hash => {
      if (hashes[hashes.length - 1] === this.props.listHashes[hash]) {
        return hash
      }
    })
    const entity = Object.keys(this.props.entities).length ? this.props.entities[keyHash[0]] : null
    const activeDashboardLinkClass = classNames({
      'entities-header-nav-link': true,
      'active-link': link[2] === 'dashboard' && (entity === undefined || entity === null)
    })
    const activeDirectoryLinkClass = classNames({
      'entities-header-nav-link': true,
      'active-link': link[2] === 'directory' && (entity === undefined || entity === null)
    })
    return (
      <div className='entities-header'>
        <div className='entities-header-content'>
          <div className='entities-logo' onClick={() => this.props.showHomePage()}>
            <Logo showHomePage={this.props.showHomePage} />
          </div>
          <div className='entities-header-nav'>
            <span
              onClick={() => this.showDashboard(this.props.match.params.address)}
              className={activeDashboardLinkClass}
            >
              Dashboard
            </span>
            <span
              onClick={() => this.showDirectory(this.props.match.params.address)}
              className={activeDirectoryLinkClass}
            >
              Businesses
            </span>
            {entity && entity.name && <span className='entities-header-nav-link-name'>
              {entity.name}
              <FontAwesome name='times-circle' onClick={() => this.showDirectory(this.props.match.params.address)} />
            </span>}
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

const mapStateToProps = (state) => ({
  entities: getEntities(state),
  listHashes: state.screens.communityEntities.listHashes
})

export default connect(mapStateToProps, null)(Header)
