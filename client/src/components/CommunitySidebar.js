import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import map from 'lodash/map'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { formatAmount, formatMoney } from 'services/global'

import { SOON_MODAL, EXCHANGE_MODAL } from 'constants/uiConstants'

import Facebook from 'images/fb.png'
import Twitter from 'images/twitter.png'
import Instagram from 'images/ig.png'
import CloseButton from 'images/x.png'
import clnCurrencyIcon from 'images/cln-coin.png'
import {getSelectedCommunity} from 'selectors/basicToken'
import {getEtherscanUrl, getColuWallet} from 'selectors/web3'
import CoinHeader from './CoinHeader'
import ReactGA from 'services/ga'

const keyToImage = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram
}

const SocialImage = ({link, name, onClick}) => (
  <a href={link} target='_blank' onClick={onClick} name={name}>
    <img src={keyToImage[name]} name={name} />
  </a>
)

class CommunitySidebar extends Component {
  state = {
    rel: null
  }
  onClickBuy = () => {
    //this.props.uiActions.loadModal(SOON_MODAL)
    this.props.uiActions.loadModal(EXCHANGE_MODAL, {isBuy: true})
    ReactGA.event({
      category: this.props.selectedCommunity.name,
      action: 'Click',
      label: 'Buy'
    })
  }

  onClickSell = () => {
    //this.props.uiActions.loadModal(SOON_MODAL)
    this.props.uiActions.loadModal(EXCHANGE_MODAL, {isBuy: false})
    ReactGA.event({
      category: this.props.selectedCommunity.name,
      action: 'Click',
      label: 'Sell'
    })
  }

  onBackMobile () {
    this.setState({
      closed: true,
      open: false
    })
  }
  onClose () {
    this.props.uiActions.hideSignup()
    this.props.uiActions.setActiveMarker()

    ReactGA.event({
      category: this.props.selectedCommunity.name,
      action: 'Click',
      label: 'Close'
    })
  }

  handleLinkClick = (event) =>
    ReactGA.event({
      category: this.props.selectedCommunity.name,
      action: 'Click',
      label: event.target.name
    })

  render () {
    const currentCoin = this.props.selectedCommunity || {}

    const control = <div className='sidebar-close' onClick={this.onClose.bind(this)}>
      <Link to='/'>
        <img src={CloseButton} />
      </Link>
    </div>

    const totalSupply = currentCoin.totalSupply ? formatMoney(formatAmount(currentCoin.totalSupply, 18), 0, '.', ',') : 'loading'
    const circulatingSupply = currentCoin.ccReserve ? formatMoney(formatAmount(currentCoin.totalSupply - currentCoin.ccReserve, 18), 0, '.', ',') : 'loading'
    const clnReserve = currentCoin.clnReserve ? formatMoney(formatAmount(currentCoin.clnReserve, 18), 0, '.', ',') : 'loading'
    const owner = currentCoin.owner === this.props.coluWallet ? 'Colu' : currentCoin.owner

    const social = currentCoin.metadata && currentCoin.metadata.social &&
      map(currentCoin.metadata.social, (value, key) => <SocialImage
        link={value} name={key} key={key} onClick={this.handleLinkClick} />)

    const sidebarClass = classNames({
      'community-sidebar': true,
      //'ios-chrome': isIOS && isChrome
      //'tablet': isTablet && !isIOS
    })

    return (
      <div className={sidebarClass} ref='bar'
        style={{
          transition: this.state.open || this.state.closed ? 'all 350ms ease-in' : 'none'
        }}>
        <div className='header'>
          <CoinHeader coinImage={currentCoin.metadata && currentCoin.metadata.imageLink} name={currentCoin.name} price={currentCoin.currentPrice} />
          {control}
          <div className='header-buttons'>
            <div className='header-button' onClick={this.onClickBuy}>BUY</div>
            <div className='header-button' onClick={this.onClickSell}>SELL</div>
          </div>
        </div>
        <div className='community-data-wrapper'>
          <div className='box'>
            <div className='box-header'>SUMMARY</div>
            <div className='box-info'>
              <div className='box-title column'>
                <p>Symbol</p>
                <p>Owner</p>
                <p>Total supply</p>
                <p>Circulating Supply</p>
                <p>CLN reserve</p>
                <p>Asset ID</p>
                <p>Market Maker ID</p>
              </div>
              <div className='box-data column'>
                <p>{currentCoin.symbol || 'loading'}</p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${currentCoin.owner}`}
                    target='_blank'
                    name='owner'
                    onClick={this.handleLinkClick}>
                    {owner || 'loading'}
                  </a>
                </p>
                <p>{totalSupply + ' ' + (currentCoin.symbol || 'loading') || 'loading'}</p>
                <p>{circulatingSupply + ' ' + (currentCoin.symbol || 'loading') || 'loading'}</p>
                <p><img src={clnCurrencyIcon} />{clnReserve || 'loading'}</p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${this.props.ui.activeMarker || currentCoin.address}`}
                    target='_blank'
                    name='assetId'
                    onClick={this.handleLinkClick}>
                    {this.props.ui.activeMarker || currentCoin.address}
                  </a>
                </p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${currentCoin.mmAddress}`}
                    target='_blank'
                    name='marketMakerId'
                    onClick={this.handleLinkClick}>
                    {currentCoin.mmAddress}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className='box'>
            <div className='box-header'>COMMUNITY</div>
            <div className='box-info column'>
              <div className='box-data'>
                <p className='description'>{(currentCoin.metadata && currentCoin.metadata.description) || 'loading'}</p>
              </div>
              <div className='separator' />
            </div>

            <div className='box-info'>
              <div className='box-title column'>
                <p>Website</p>
                <p>Location</p>
                <p>Social</p>
              </div>
              <div className='box-data column'>
                <p>
                  <a href={currentCoin.metadata && currentCoin.metadata.website}
                    target='_blank'
                    name='website'
                    onClick={this.handleLinkClick}>
                    {currentCoin.metadata && currentCoin.metadata.website}
                  </a>
                </p>
                <p>{currentCoin.metadata && currentCoin.metadata.location.name}</p>

                <div className='social flex'>
                  {social}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    tokens: state.tokens,
    ui: state.ui,
    selectedCommunity: getSelectedCommunity(state),
    etherscanUrl: getEtherscanUrl(state),
    coluWallet: getColuWallet(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    uiActions: bindActionCreators(uiActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunitySidebar)
