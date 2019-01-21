import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {formatEther, formatWei} from 'utils/format'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import CommunityLogo from 'components/elements/CommunityLogo'
import Calculator from 'images/Calculator.svg'
import { BigNumber } from 'bignumber.js'
import identity from 'lodash/identity'

const canInsertCLN = (props) => props.account &&
  (props.marketMaker.isOpenForPublic || props.account === props.token.owner)

export default class Community extends Component {
  canInsertCLN = () => this.props.canInsertCLN(this.props)

  canOpenMarket = () => !this.props.marketMaker.isOpenForPublic && this.props.account === this.props.token.owner

  openMarket = () => {
    if (this.canOpenMarket()) {
      this.props.openMarket(this.props.token.address)
    }
  }

  handleAddCln = () => this.canInsertCLN(this.props) && this.props.handleAddCln(this.props.token, this.props.marketMaker)

  handleLoadCalculator = () => this.props.loadCalculator(this.props.token, this.props.marketMaker)

  render () {
    const {currentPrice} = this.props.marketMaker

    const clnReserve = formatWei(this.props.marketMaker.clnReserve, 0)
    const coinStatusClassStyle = classNames({
      'coin-status': true,
      'coin-status-active': this.props.marketMaker.isOpenForPublic,
      'coin-status-close': !this.props.marketMaker.isOpenForPublic
    })
    return <div className={this.props.coinWrapperClassName}>
      <div className='coin-header' onClick={this.props.handleOpen}>
        <CommunityLogo token={this.props.token} />
        <div className='coin-details'>
          <h3 className='coin-name'>{this.props.token.name}</h3>
          <p className='coin-total'>
            Total CC supply
            <span className={classNames('total-text', 'positive-number')}>
              {formatWei(this.props.token.totalSupply, 0)}
            </span>
          </p>
          <button onClick={this.handleLoadCalculator} className='btn-calculator'>
            <img src={Calculator} />
          </button>
          <div className={coinStatusClassStyle}>
            <span className='coin-status-indicator' />
            <span className='coin-status-text' onClick={this.openMarket}>
              {this.props.marketMaker.isOpenForPublic ? 'open to public' : 'closed to public'}
            </span>
          </div>
        </div>
      </div>
      <div className='coin-footer'>
        <div className='coin-content'>
          {this.props.wrapper !== 'summary' && [
            <div className='total-content' key={0}>CLN Reserved</div>,
            <div key={1}>
              {this.props.marketMaker.clnReserve && !this.props.marketMaker.clnReserve.isZero()
                ? <div onClick={this.handleAddCln} className='coin-reverse'>
                  {clnReserve}
                </div>
                : <button disabled={!this.canInsertCLN()} onClick={this.handleAddCln} className='btn-adding'>
                  <FontAwesome name='plus' className='top-nav-issuance-plus' /> Add CLN
                </button>
              }
            </div>
          ]}
        </div>
        <div className='coin-content'>
          <div>
            <span className='coin-currency-type'>USD</span>
            <span className='coin-currency'>{formatEther(currentPrice.multipliedBy(this.props.usdPrice))}</span>
          </div>
          <div>
            <span className='coin-currency-type'>CLN</span>
            <span className='coin-currency'>{formatEther(currentPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  }
}

Community.defaultProps = {
  canInsertCLN,
  coinWrapperClassName: 'coin-wrapper',
  wrapper: 'wrapper',
  token: {
  },
  marketMaker: {
    isOpenForPublic: false,
    currentPrice: new BigNumber(0),
    clnReserve: new BigNumber(0)
  },
  handleOpen: identity,
  handleAddCln: identity,
  openMarket: identity,
  loadCalculator: identity
}

Community.propTypes = {
  coinWrapperClassName: PropTypes.string,
  canInsertCLN: PropTypes.func,
  handleOpen: PropTypes.func,
  openMarket: PropTypes.func,
  handleAddCln: PropTypes.func,
  token: PropTypes.object,
  usdPrice: PropTypes.number,
  wrapper: PropTypes.string,
  marketMaker: PropTypes.object
}
