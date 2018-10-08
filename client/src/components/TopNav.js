import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { isMobile, MobileView } from 'react-device-detect'
import {BigNumber} from 'bignumber.js'
import FontAwesome from 'react-fontawesome'

import * as actions from 'actions/ui'
import {getClnBalance} from 'selectors/accounts'
import { LOGIN_MODAL } from 'constants/uiConstants'

import ClnIcon from 'images/cln.png'
import MenuIcon from 'images/menu.png'
import ProfileIcon from 'images/profile.png'
import ClnCoinIcon from 'images/cln-coin.png'
import ReactGA from 'services/ga'

class TopNav extends Component {
  state = {
    openMenu: false
  }
  onClickMenu = () => {
    this.setState({
      openMenu: !this.state.openMenu
    })
  }

  showConnectMetamask = () => {
    if (!this.props.network.isMetaMask || !this.props.network.accountAddress) {
      this.props.loadModal(LOGIN_MODAL)
      ReactGA.event({
        category: 'Top Bar',
        action: 'Click',
        label: 'Connect Metamask'
      })
    }
  }

  showContactUs = () => {
    if (this.props.history.location.pathname === '/view/contact-us') {
      this.props.history.replace('/view/contact-us')
    } else {
      this.props.history.push('/view/contact-us')
    }
    this.setState({
      openMenu: !this.state.openMenu
    })
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: 'contactUs'
    })
  }

  showIssuance = () => {
    if (this.props.history.location.pathname === '/view/issuance') {
      this.props.history.replace('/view/issuance')
    } else {
      this.props.history.push('/view/issuance')
    }
    this.setState({
      openMenu: !this.state.openMenu
    })
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: 'issuance'
    })
  }

  handleLinkClick = (event) =>
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: event.target.name
    })

  render () {
    const topNavClass = classNames({
      'active': this.props.active,
      'top-navigator': true
    })
    const navLinksClass = classNames({
      'hide': !this.state.openMenu && isMobile,
      'top-nav-links': true,
      'show-top-nav-links': true,
      'hide-nav-links': !isMobile
    })

    return <div className={topNavClass}>
      <a href='https://cln.network/' target='_blank'><img src={ClnIcon} /></a>
      {!isMobile && <FontAwesome name='align-justify' className='burger-menu' onClick={this.props.setToggleMenu} />}
      <div className={navLinksClass}>
        <div onClick={this.showIssuance} >
          <div className='top-nav-text'>Issuance</div>
        </div>
        <a className='top-nav-text'
          href='https://cln.network/pdf/cln_whitepaper.pdf'
          target='_blank'
          name='whitepaper'
          onClick={this.handleLinkClick}>
          Whitepaper</a>
        <div className='separator' />
        <a className='top-nav-text'
          href='https://intercom.help/colu_cln/community-currencies'
          target='_blank'
          name='FAQ'
          onClick={this.handleLinkClick}>FAQ</a>
        <div className='separator' />
        <div style={{width: isMobile ? '100%' : 'auto'}} onClick={this.showContactUs} >
          <div className='top-nav-text'>Contact us</div>
        </div>
        <div className='separator' />
        <div className='separator-vertical' />
        <div className='top-nav-text profile' onClick={this.showConnectMetamask}>
          <img src={ProfileIcon} />
          <span>{this.props.network.accountAddress || 'Connect Metamask'}</span>
        </div>
        {(this.props.clnBalance)
          ? <div className='top-nav-balance'>
            <span>Balance:</span>
            <img src={ClnCoinIcon} />
            <span className='balance-text'>{new BigNumber(this.props.clnBalance).div(1e18).toFormat(2, 1)}</span>
          </div>
          : null}
        <div className='separator' />
      </div>

      <MobileView device={isMobile}>
        <img src={MenuIcon} className='mobile-menu-icon' onClick={this.onClickMenu} />
      </MobileView>
    </div>
  }
}

const mapStateToProps = state => {
  return {
    network: state.network,
    clnBalance: getClnBalance(state)
  }
}

export default connect(mapStateToProps, actions)(TopNav)
