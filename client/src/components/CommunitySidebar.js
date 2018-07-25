import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Link from 'react-router-dom/Link'
import map from 'lodash/map'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { formatAmount, formatMoney } from 'services/global'

import { LOGIN_MODAL, SOON_MODAL, EXCHANGE_MODAL } from 'constants/uiConstants'

import Facebook from 'images/fb.png'
import Twitter from 'images/twitter.png'
import Instagram from 'images/ig.png'
import CloseButton from 'images/x.png'
import clnCurrencyIcon from 'images/cln-coin.png'
import {isOpenForPublic} from 'actions/marketMaker'
import {getSelectedCommunity} from 'selectors/basicToken'
import {getEtherscanUrl, getColuWallet} from 'selectors/web3'
import CoinHeader from './CoinHeader'
import Loader from 'components/Loader'
import ReactGA from 'services/ga'
import withEither from 'containers/withEither'

const withCommunity = withEither(props => !props.selectedCommunity,
  (props) => null)

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

  componentDidMount = () => {
    this.props.isOpenForPublic(this.props.selectedCommunity.address)
  }

  componentDidUpdate (prevProps) {
    if (this.props.selectedCommunity.address !== prevProps.selectedCommunity.address) {
      this.props.isOpenForPublic(this.props.selectedCommunity.address)
    }
  }

  onClickBuy = () => {
    if (this.props.selectedCommunity.isOpenForPublic) {
      ReactGA.event({
        category: this.props.selectedCommunity.name,
        action: 'Click',
        label: 'Buy'
      })
      if (this.props.accountAddress) {
        this.props.uiActions.loadModal(EXCHANGE_MODAL, {isBuy: true})
      } else {
        this.props.uiActions.loadModal(LOGIN_MODAL)
      }
    } else {
      this.props.uiActions.loadModal(SOON_MODAL)
    }
  }

  onClickSell = () => {
    if (this.props.selectedCommunity.isOpenForPublic) {
      ReactGA.event({
        category: this.props.selectedCommunity.name,
        action: 'Click',
        label: 'Sell'
      })
      if (this.props.accountAddress) {
        this.props.uiActions.loadModal(EXCHANGE_MODAL, {isBuy: false})
      } else {
        this.props.uiActions.loadModal(LOGIN_MODAL)
      }
    } else {
      this.props.uiActions.loadModal(SOON_MODAL)
    }
  }

  onBackMobile () {
    this.setState({
      closed: true,
      open: false
    })
  }

  onClose = () => {
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
    const {selectedCommunity} = this.props

    const control = <div className='sidebar-close' onClick={this.onClose}>
      <Link to='/'>
        <img src={CloseButton} />
      </Link>
    </div>

    const totalSupply = selectedCommunity.totalSupply ? formatMoney(formatAmount(selectedCommunity.totalSupply, 18), 0, '.', ',') : <Loader class="loader"/>
    const circulatingSupply = selectedCommunity.ccReserve && formatMoney(formatAmount(selectedCommunity.totalSupply - selectedCommunity.ccReserve, 18), 0, '.', ',')
    const clnReserve = selectedCommunity.clnReserve && formatMoney(formatAmount(selectedCommunity.clnReserve, 18), 0, '.', ',')
    const owner = selectedCommunity.owner === this.props.coluWallet ? "Colu" : selectedCommunity.owner

    const social = selectedCommunity.metadata && selectedCommunity.metadata.social &&
      map(selectedCommunity.metadata.social, (value, key) => <SocialImage
        link={value} name={key} key={key} onClick={this.handleLinkClick} />)

    const sidebarClass = classNames({
      "community-sidebar": true,
    })

    return (
      <div className={sidebarClass} ref='bar'
        style={{
          transition: this.state.open || this.state.closed ? 'all 350ms ease-in' : 'none'
        }}>
        <div className='header'>
          <CoinHeader coinImage={selectedCommunity.metadata && selectedCommunity.metadata.imageLink} name={selectedCommunity.name} price={selectedCommunity.currentPrice} />
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
              <div className="box-data column">
                <p>{selectedCommunity.symbol ? selectedCommunity.symbol : <Loader class="loader"/>}</p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${selectedCommunity.owner}`}
                    target='_blank'
                    name='owner'
                    onClick={this.handleLinkClick}>
                    {owner || <Loader class="loader"/>}
                  </a>
                </p>
                <p>{totalSupply && selectedCommunity.symbol ? totalSupply + ' ' + selectedCommunity.symbol : <Loader class="loader"/>}</p>
                <p>{circulatingSupply && selectedCommunity.symbol ? circulatingSupply + ' ' + selectedCommunity.symbol : <Loader class="loader"/>}</p>
                <p>{clnReserve && <img src={clnCurrencyIcon}/>}{clnReserve ? clnReserve : <Loader class="loader"/>}</p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${this.props.ui.activeMarker || selectedCommunity.address}`}
                    target='_blank'
                    name='assetId'
                    onClick={this.handleLinkClick}>
                      {this.props.ui.activeMarker || selectedCommunity.address || <Loader class="loader"/>}
                    </a>
                </p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${selectedCommunity.mmAddress}`}
                    target='_blank'
                    name='marketMakerId'
                    onClick={this.handleLinkClick}>
                    {selectedCommunity.mmAddress || <Loader class="loader"/>}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="box">
            <div className="box-header">COMMUNITY</div>
            <div className="box-info column">
              <div className="box-data">
                <p className="description">{selectedCommunity.metadata && selectedCommunity.metadata.description || <Loader class="loader"/>}</p>
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
                  <a href={selectedCommunity.metadata && selectedCommunity.metadata.website}
                    target='_blank'
                    name='website'
                    onClick={this.handleLinkClick}>
                    {(selectedCommunity.metadata && selectedCommunity.metadata.website) || <Loader class="loader"/>}
                  </a>
                </p>
                <p>{(selectedCommunity.metadata && selectedCommunity.metadata.location.name) || <Loader class="loader"/>}</p>

                <div className="social flex">
                  {social || <Loader class="loader"/>}
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
    coluWallet: getColuWallet(state),
    accountAddress: state.web3.accountAddress
  }
}

const mapDispatchToProps = dispatch => {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    isOpenForPublic: bindActionCreators(isOpenForPublic, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withCommunity(CommunitySidebar))
