import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'
import {BigNumber} from 'bignumber.js'

import * as actions from 'actions/ui'
import {getClnBalance} from 'selectors/accounts'
import { LOGIN_MODAL, CONTACT_FORM } from 'constants/uiConstants'

import ClnIcon from 'images/cln.png'
import ProfileIcon from 'images/user.svg'
import ReactGA from 'services/ga'
import PersonalSidebar from 'components/PersonalSidebar'

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
      ReactGA.event({
        category: 'Top Bar',
        action: 'Click',
        label: 'Connect Metamask'
      })
    }
  }

  showContactUs = () => {
    this.props.loadModal(CONTACT_FORM)
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
      'hide': !this.state.openMenu,
      'top-nav-links': true,
      'show-top-nav-links': true
    })
    return (
      <div className={topNavClass}>
        <div className='top-nav-logo'>
          <a href='https://cln.network/' target='_blank'><img src={ClnIcon} /></a>
        </div>
        <div className={navLinksClass}>
          <button onClick={this.showIssuance} className='top-nav-issuance'>
            <FontAwesome name='plus' className='top-nav-issuance-plus' onClick={this.props.setToggleMenu} /> Currency issuer
          </button>
          <div className='top-nav-currency'>
            <a className='top-nav-text'
              href='https://intercom.help/colu_cln/community-currencies'
              target='_blank'
              name='FAQ'
              onClick={this.handleLinkClick}>FAQ</a>
            <a className='top-nav-text'
              href='https://cln.network/wp-content/uploads/pdf/cln_whitepaper.pdf'
              target='_blank'
              name='whitepaper'
              onClick={this.handleLinkClick}>
              Whitepaper</a>
            <div style={{width: isMobile ? '100%' : 'auto'}} onClick={this.showContactUs} >
              <a className='top-nav-text'>Contact us</a>
            </div>
            <div className='separator-vertical' />
          </div>
          <div className='top-nav-text profile' onClick={this.showConnectMetamask}>
            <span className='profile-icon' onClick={this.showProfile}>
              <img src={ProfileIcon} />
            </span>
            <span className='profile-balance'>
              <span className='balance-address'>{this.props.network.accountAddress || 'Connect Metamask'}</span>
              {(this.props.clnBalance)
                ? <div className='top-nav-balance'>
                  <span className='balance-text'>Balance:</span>
                  <span className='balance-number'>{new BigNumber(this.props.clnBalance).div(1e18).toFormat(2, 1)}</span>
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
