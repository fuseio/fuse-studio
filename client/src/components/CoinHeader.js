import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {formatEther} from 'utils/format'
import Loader from 'components/Loader'
import Info from 'images/info.png'
import {PRICE_EXPLANATION_MODAL} from 'constants/uiConstants'

export default class CoinHeader extends Component {
  loadModal = (e) => {
    this.props.loadModal(PRICE_EXPLANATION_MODAL, {token: this.props.token})
    e.stopPropagation()
  }

  render () {
    const {currentPrice, name, metadata} = this.props.token
    const formattedPrice = (currentPrice || currentPrice === 0) && formatEther(currentPrice)
    const coinImage = metadata && metadata.imageLink
    const fiatCurrencyPrice = this.props.fiat.USD && this.props.fiat.USD.price
    const fiatPrice = currentPrice * fiatCurrencyPrice
    return (
      <div className='coin-header'>
        {coinImage ? <img src={coinImage} className='logo' /> : <Loader className='loader image' />}
        <div className='coin-details'>
          <h1>{name || <Loader className='loader' />}</h1>
          <div className='separator' />
          <div className='price-wrapper'>
            <h2>Current price:</h2>
            <p>{formattedPrice ? formattedPrice + ' CLN' : <Loader className='loader' />}</p>
          </div>
          <div className='price-wrapper'>
            <h2>Est. Denomination:</h2>
            <p>{fiatPrice ? <span>
              {formatEther(fiatPrice)} USD<img src={Info} className='info' onClick={this.loadModal} /></span> : <Loader className='loader' />}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

CoinHeader.defaultProps = {
  token: {}
}

CoinHeader.propTypes = {
  token: PropTypes.object,
  fiat: PropTypes.object,
  loadModal: PropTypes.func.isRequired
}
