import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

import * as actions from 'actions/ui'
import {getClnBalance} from 'selectors/accounts'
import { LOGIN_MODAL } from 'constants/uiConstants'

import Logo from 'components/Logo'
import WalletIcon from 'images/wallet.svg'
import ReactGA from 'services/ga'
import PersonalSidebar from 'components/PersonalSidebar'

const NavList = [
  {
    'name': 'Blog',
    'link': 'https://medium.com/colu'
  },
  {
    'name': 'Explore',
    'link': 'https://explorer.fuse.io/'
  },
  {
    'name': 'Token',
    'link': 'http://beta.fuse.io/network-token/'
  },
  {
    'name': 'Learn',
    'link': '/'
  }
]

class TopNav extends Component {
  state = {
    openMenu: false,
    profile: false
  }

  onClickMenu = () => {
    this.setState({
      openMenu: !this.state.openMenu
    })
  }

  closeProfile = () => this.setState({profile: false})

  showProfile = () => this.setState({profile: true})

  showConnectMetamask = () => {
    if (!this.props.network.accountAddress) {
      this.props.loadModal(LOGIN_MODAL)
    }
  }

  showIssuance = () => {
    this.props.history.push('/view/issuance')
    this.setState({
      openMenu: !this.state.openMenu
    })
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: 'issuance'
    })
  }

  showAppStore = () => {
    this.props.history.push('/view/appstore')
    this.setState({
      openMenu: !this.state.openMenu
    })
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: 'AppStore'
    })
  }

  showHomePage = () => {
    this.props.history.push('/')
  }

  renderNetworkName = (name) => {
    switch (name) {
      case 'main': return 'Ethereum'
      default: return name
    }
  }

  render () {
    const topNavClass = classNames({
      'active': this.props.active,
      'top-navigator': true,
      'navigator-appstore': this.props.type === 'appstore'
    })
    const navLinksClass = classNames({
      'hide': !this.state.openMenu,
      'top-nav-links': true,
      'show-top-nav-links': true
    })
    return (
      <div className={topNavClass}>
        <div className='top-nav-logo'>
          <Logo showHomePage={this.showHomePage} />
        </div>
        <div className={navLinksClass}>
          <button onClick={this.showIssuance} className='top-nav-issuance'>
            <FontAwesome name='plus' className='top-nav-issuance-plus' onClick={this.props.setToggleMenu} /> Currency issuer
          </button>
          <div className='top-nav-currency'>
            {NavList.map(item =>
              <a className='top-nav-text'
                href={item.link}
                target='_blank'
                name={item.name}
              >
                {item.name}
              </a>
            )}
          </div>
          <div className='top-nav-text profile' onClick={this.showConnectMetamask}>
            <span className='profile-icon' onClick={this.showProfile}>
              <img src={WalletIcon} />
            </span>
            <span className='profile-balance'>
              <span className='balance-address'>{this.props.network.accountAddress || 'Connect Metamask'}</span>
              {(this.props.network)
                ? <div className='top-nav-balance'>
                  <span className='balance-text'>Network:</span>
                  <span className='balance-number'>{this.renderNetworkName(this.props.network.networkType)}</span>
                </div>
                : null}
            </span>
          </div>
        </div>
        <FontAwesome name={this.state.openMenu ? 'times' : 'align-justify'} className='burger-menu' onClick={this.onClickMenu} />
        {this.state.profile &&
          <PersonalSidebar
            closeProfile={this.closeProfile}
            clnBalance={this.props.clnBalance}
            network={this.props.network}
            history={this.props.history}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    network: state.network,
    clnBalance: getClnBalance(state)
  }
}

export default connect(mapStateToProps, actions)(TopNav)
