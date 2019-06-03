import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'

import * as actions from 'actions/ui'
import { getClnBalance } from 'selectors/accounts'
import { LOGIN_MODAL } from 'constants/uiConstants'

import Logo from 'components/Logo'
import WalletIcon from 'images/wallet.svg'
import ReactGA from 'services/ga'
import PersonalSidebar from 'components/PersonalSidebar'
import { convertNetworkName } from 'utils/network'
import CopyToClipboard from 'components/common/CopyToClipboard'

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

  handleProfile = (profile) => this.setState({ profile })

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

  showHomePage = () => {
    this.props.history.push('/')
  }

  renderAccountAddress (address) {
    const firstAddressPart = address.substring(0, 6)
    const lastAddressPart = address.substring(address.length - 4, address.length + 1)
    return (
      <div className='nav-address'>
        <span>{firstAddressPart + '...' + lastAddressPart}</span>
        <CopyToClipboard text={address}>
          <FontAwesome name='clone' />
        </CopyToClipboard>
      </div>
    )
  }

  renderAccountSection = () => {
    const { profile } = this.state

    if (!this.props.network.accountAddress) {
      return (
        <div className={classNames('top-nav-text profile empty-wallet', { 'profile--open': profile })} onClick={this.showConnectMetamask}>
          <span className='profile-icon empty-wallet' >
            <img src={WalletIcon} />
          </span>
          <div className='profile-balance'>
            <span className='balance-address'>Connect your wallet</span>
            {(this.props.network) && <div className='top-nav-balance' onClick={() => this.handleProfile(!profile)}>
              <span className='balance-text'>Network:&nbsp;</span>
              <span className='balance-number'>{convertNetworkName(this.props.network.networkType)}</span>
            </div>}
          </div>
        </div>
      )
    } else {
      return (
        <div className={classNames('top-nav-text profile', { 'profile--open': profile })} onClick={() => this.handleProfile(!profile)}>
          <span className='profile-icon'>
            <img src={WalletIcon} />
          </span>
          <div className='profile-balance'onClick={() => this.handleProfile(!profile)}>
            <span className='balance-address'>{this.renderAccountAddress(this.props.network.accountAddress)}</span>
            {(this.props.network) && <div className='top-nav-balance'>
              <span className='balance-text'>Network:&nbsp;</span>
              <span className='balance-number'>{convertNetworkName(this.props.network.networkType)}</span>
            </div>}
          </div>
        </div>
      )
    }
  }

  render () {
    const topNavClass = classNames({
      'active': this.props.active,
      'top-navigator': true,
      [this.props.network.networkType]: true
    })
    const navLinksClass = classNames({
      'hide-for-small-only': !this.state.openMenu,
      'top-nav-links': true,
      'show-top-nav-links': true
    })

    const { network: { networkType } } = this.props
    return (
      <div className={topNavClass}>
        <div className='top-nav-logo'>
          <Logo showHomePage={this.showHomePage} />
        </div>
        <div className={navLinksClass}>
          {
            networkType && networkType !== 'fuse' && (
              <button onClick={this.showIssuance} className='top-nav-issuance'>
                <FontAwesome name='plus' className='top-nav-issuance-plus' onClick={this.props.setToggleMenu} /> Currency issuer
              </button>
            )
          }
          <div className='top-nav-currency'>
            {NavList.map((item, key) =>
              <a className='top-nav-text'
                href={item.link}
                target='_blank'
                name={item.name}
                key={key}
              >
                {item.name}
              </a>
            )}
          </div>
          {this.renderAccountSection()}
        </div>
        <FontAwesome name={this.state.openMenu ? 'times' : 'align-justify'} className='burger-menu' onClick={this.onClickMenu} />
        {this.state.profile &&
          <PersonalSidebar
            closeProfile={() => this.handleProfile(false)}
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
