import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classNames from 'classnames'
import { isMobile, MobileView } from 'react-device-detect'

import * as uiActions from 'actions/ui'
import { formatAmount, formatMoney } from 'services/global'
import {getBalances} from 'selectors/accounts'
import {getAddresses} from 'selectors/web3'
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
    if (!this.props.web3.isMetaMask || !this.props.web3.isAccountUnlocked) {
      this.props.uiActions.loadModal(LOGIN_MODAL)
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

  handleLinkClick = (event) =>
    ReactGA.event({
      category: 'Top Bar',
      action: 'Click',
      label: event.target.name
    })

  render () {
    let topNavClass = classNames({
      'active': this.props.active,
      'top-navigator': true
    })
    let navLinksClass = classNames({
      'hide': !this.state.openMenu && isMobile,
      'top-nav-links': true
    })

    return <div className={topNavClass}>
      <a href='https://cln.network/' target='_blank'><img src={ClnIcon} /></a>

      <div className={navLinksClass}>
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
          <span>{this.props.web3.accountAddress || 'Connect Metamask'}</span>
        </div>
        {(this.props.addresses && this.props.balances[this.props.addresses.ColuLocalNetwork]) ? <div className='top-nav-balance'>
          <span>Balance:</span>
          <img src={ClnCoinIcon} />
          <span className='balance-text'>{this.props.balances[this.props.addresses.ColuLocalNetwork] && formatMoney(formatAmount(this.props.balances[this.props.addresses.ColuLocalNetwork], 18), 2, '.', ',')}</span>
        </div> : null}
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
    web3: state.web3,
    addresses: getAddresses(state),
    balances: getBalances(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    uiActions: bindActionCreators(uiActions, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TopNav)
