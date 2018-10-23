import React, { Component } from 'react'
import { connect } from 'react-redux'
import Link from 'react-router-dom/Link'
import map from 'lodash/map'
import * as actions from 'actions/ui'
import { formatWei } from 'utils/format'

import { LOGIN_MODAL, EXCHANGE_MODAL } from 'constants/uiConstants'

import Facebook from 'images/fb.png'
import Twitter from 'images/twitter.png'
import Instagram from 'images/ig.png'
import CloseButton from 'images/x.png'
import clnCurrencyIcon from 'images/cln-coin.png'
import {getSelectedCommunity} from 'selectors/communities'
import {getEtherscanUrl, getColuWallet} from 'selectors/network'
import Community from './Community'
import Loader from 'components/Loader'
import ReactGA from 'services/ga'
import {withMaybe} from 'utils/components'

const withCommunity = withMaybe(props => !props.selectedCommunity)

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
  onClickBuy = () => this.onClick(true)

  onClickSell = () => this.onClick(false)

  onClick = (isBuy) => {
    ReactGA.event({
      category: this.props.selectedCommunity.name,
      action: 'Click',
      label: isBuy ? 'Buy' : 'Sell'
    })
    if (this.props.accountAddress) {
      this.props.loadModal(EXCHANGE_MODAL, {isBuy})
    } else {
      this.props.loadModal(LOGIN_MODAL)
    }
  }

  componentWillUnmount () {
    this.props.hideModal()
  }

  onClose = () => {
    this.props.hideSignup()
    this.props.setActiveMarker()

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
    const {selectedCommunity, fiat} = this.props

    const control = <div className='sidebar-close' onClick={this.onClose}>
      <Link to='/'>
        <img src={CloseButton} />
      </Link>
    </div>

    const totalSupply = selectedCommunity.totalSupply ? formatWei(selectedCommunity.totalSupply) : <Loader className='loader' />
    const circulatingSupply = selectedCommunity.ccReserve && formatWei(selectedCommunity.totalSupply - selectedCommunity.ccReserve)
    const clnReserve = selectedCommunity.clnReserve && formatWei(selectedCommunity.clnReserve)
    const owner = selectedCommunity.owner === this.props.coluWallet ? 'Colu' : selectedCommunity.owner

    const social = selectedCommunity.metadata && selectedCommunity.metadata.social &&
      map(selectedCommunity.metadata.social, (value, key) => <SocialImage
        link={value} name={key} key={key} onClick={this.handleLinkClick} />)

    return (
      <div className='community-sidebar'>
        <div className='header'>
          <Community token={selectedCommunity} fiat={fiat} loadModal={this.props.loadModal} />
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
                <p>{selectedCommunity.symbol ? selectedCommunity.symbol : <Loader className='loader' />}</p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${selectedCommunity.owner}`}
                    target='_blank'
                    name='owner'
                    onClick={this.handleLinkClick}>
                    {owner || <Loader className='loader' />}
                  </a>
                </p>
                <p>{totalSupply && selectedCommunity.symbol ? totalSupply + ' ' + selectedCommunity.symbol : <Loader className='loader' />}</p>
                <p>{circulatingSupply && selectedCommunity.symbol ? circulatingSupply + ' ' + selectedCommunity.symbol : <Loader className='loader' />}</p>
                <p>{clnReserve && <img src={clnCurrencyIcon} />}{clnReserve || <Loader className='loader' />}</p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${this.props.ui.activeMarker || selectedCommunity.address}`}
                    target='_blank'
                    name='assetId'
                    onClick={this.handleLinkClick}>
                    {this.props.ui.activeMarker || selectedCommunity.address || <Loader className='loader' />}
                  </a>
                </p>
                <p>
                  <a href={`${this.props.etherscanUrl}address/${selectedCommunity.mmAddress}`}
                    target='_blank'
                    name='marketMakerId'
                    onClick={this.handleLinkClick}>
                    {selectedCommunity.mmAddress || <Loader className='loader' />}
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className='box'>
            <div className='box-header'>COMMUNITY</div>
            <div className='box-info column'>
              <div className='box-data'>
                <p className='description'>{(selectedCommunity.metadata && selectedCommunity.metadata.description) || <Loader className='loader' />}</p>
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
                    {(selectedCommunity.metadata && selectedCommunity.metadata.website) || <Loader className='loader' />}
                  </a>
                </p>
                <p>{(selectedCommunity.metadata && selectedCommunity.metadata.location.name) || <Loader className='loader' />}</p>

                <div className='social flex'>
                  {social || <Loader className='loader' />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  tokens: state.tokens,
  ui: state.ui,
  selectedCommunity: getSelectedCommunity(state),
  etherscanUrl: getEtherscanUrl(state),
  coluWallet: getColuWallet(state),
  accountAddress: state.network.accountAddress,
  fiat: state.fiat
})

export default connect(
  mapStateToProps,
  actions
)(withCommunity(CommunitySidebar))
