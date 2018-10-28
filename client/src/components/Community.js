import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {formatEther} from 'utils/format'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import CoinImage from 'images/Coin2.svg'
import Calculator from 'images/Calculator.svg'
import { BigNumber } from 'bignumber.js'

export default class Community extends Component {
  handleClick = () => this.props.handleCommunityClick(this.props.token.address)

  handleClose = () => this.props.handleCommunityClick(null)

  render () {
    const fiatCurrencyPrice = this.props.fiat.USD && this.props.fiat.USD.price
    const {currentPrice} = this.props.marketMaker
    const clnReverse = (parseFloat(formatEther(this.props.marketMaker.clnReserve).replace(/[,.]/g, '.'))).toFixed(3).replace(/[,.]/g, ',')

    const coinStatusClassStyle = classNames({
      'coin-status': true,
      'coin-status-active': this.props.marketMaker.isOpenForPublic,
      'coin-status-close': !this.props.marketMaker.isOpenForPublic
    })

    const coinWrapperStyle = classNames({
      'coin-wrapper': true,
      'coin-show-footer': this.props.selectedCommunityAddress === this.props.token.address
    })

    return <div className='list-item' >
      <div className={coinWrapperStyle}>
        <div className='coin-header' onClick={this.handleClick}>
          <div className='coin-logo'>
            <img src={CoinImage} className='logo-img' />
            <span className='symbol-text'>{this.props.token.symbol}</span>
          </div>
          <div className='coin-details'>
            <h3 className='coin-name'>{this.props.token.name}</h3>
            <p className='coin-total'>Total CC supply <span className='total-text'>{formatEther(this.props.token.totalSupply)}</span></p>
            <button className='btn-calculator'>
              <img src={Calculator} />
            </button>
            <div className={coinStatusClassStyle}>
              <span className='coin-status-indicator' /> <span className='coin-status-text'>{this.props.marketMaker.isOpenForPublic ? 'open' : 'close'}</span>
            </div>
          </div>
        </div>
        <div className='coin-footer'>
          <div className='coin-content'>
            <div className='total-content'>CLN Reserved</div>
            {this.props.marketMaker.clnReserve
              ? <div className='coin-reverse'>
                {clnReverse}
              </div>
              : <button className='btn-adding'>
                <FontAwesome name='plus' className='top-nav-issuance-plus' /> Add CLN
              </button>
            }
          </div>
          <div className='coin-content'>
            <div>
              <span className='coin-currency-type'>USD</span>
              <span className='coin-currency'>{formatEther(currentPrice.multipliedBy(fiatCurrencyPrice))}</span>
            </div>
            <div>
              <span className='coin-currency-type'>CLN</span>
              <span className='coin-currency'>{formatEther(currentPrice)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='coin-footer-close' onClick={this.handleClose}>
        <FontAwesome name='times-circle' /> Close
      </div>
    </div>
  }
}

Community.defaultProps = {
  token: {
  },
  marketMaker: {
    currentPrice: new BigNumber(0),
    clnReserve: new BigNumber(0)
  }
}

Community.propTypes = {
  token: PropTypes.object,
  fiat: PropTypes.object,
  marketMaker: PropTypes.object
}
