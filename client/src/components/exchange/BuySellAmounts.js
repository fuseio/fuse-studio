import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import * as uiActions from 'actions/ui'
import { buyQuote, sellQuote, invertBuyQuote, invertSellQuote, estimateGasBuyCc, estimateGasSellCc } from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import { formatAmountReal, formatMoney } from 'services/global'
import { getSelectedCommunity, getClnToken } from 'selectors/basicToken'

import TextInput from 'components/TextInput'
import { BigNumber } from 'bignumber.js'
import DownArrow from 'images/down-arrow.png'
import Arrows from 'images/arrows.png'
import Info from 'images/info.png'

class BuySellAmounts extends React.Component {
  state = {
    toCC: true,
    cln: this.props.cln || '',
    cc: this.props.cc || '',
    advanced: false
  }

  componentWillMount () {
    if (this.props.isBuy === true || this.props.isBuy === false) {
      this.setState({buyTab: this.props.isBuy})
    } else {
      this.setState({buyTab: true})
    }
  }

  next = () => {
    if (this.props.isBuy) {
      this.props.estimateGasBuyCc(this.props.community.address, new BigNumber(this.state.cln).multipliedBy(1e18), this.state.minimum)
    } else {
      this.props.estimateGasSellCc(this.props.community.address, new BigNumber(this.state.cc).multipliedBy(1e18), this.state.minimum)
    }

    this.props.uiActions.setBuyStage(2)
    this.props.uiActions.setBuySellAmounts({
      ccAddress: this.props.community.address,
      cln: this.state.cln,
      cc: this.state.cc,
      isBuy: this.state.buyTab,
      minimum: this.state.minimum
    })
  }

  handleCLNInput = (event) => {
    const cln = event.target.value ? new BigNumber(event.target.value).multipliedBy(1e18) : 0
    const clnBalance = this.props.web3.accountAddress && this.props.clnToken && this.props.clnToken.balanceOf && new BigNumber(this.props.clnToken.balanceOf)

    this.setState({cln: event.target.value, toCC: true, loading: true, maxAmountError: cln && cln.isGreaterThan(clnBalance) && 'Insufficient Funds'})
    if (this.state.buyTab) {
      this.props.buyQuote(this.props.community.address, cln)
    } else {
      this.props.invertSellQuote(this.props.community.address, cln)
    }
  }

  handleCCInput = (event) => {
    const cc = event.target.value ? new BigNumber(event.target.value).multipliedBy(1e18) : 0

    this.setState({cc: event.target.value, toCC: false, loading: true})
    if (this.state.buyTab) {
      this.props.invertBuyQuote(this.props.community.address, cc)
    } else {
      this.props.sellQuote(this.props.community.address, cc)
    }
  }

  componentWillUpdate = (nextProps, nextState) => {
    const clnBalance = this.props.web3.accountAddress && this.props.clnToken && this.props.clnToken.balanceOf && new BigNumber(this.props.clnToken.balanceOf)

    if (!isEqual(nextProps.buyQuotePair, this.props.buyQuotePair) || !isEqual(nextProps.sellQuotePair, this.props.sellQuotePair)) {
      if (this.state.buyTab && this.state.toCC) {
        this.setState({
          cc: new BigNumber(nextProps.buyQuotePair.outAmount).div(1e18).toFixed(5),

          loading: false,
          slippage: nextProps.buyQuotePair.slippage && new BigNumber(nextProps.buyQuotePair.slippage).toFixed(10),
          //maxAmountError: nextProps.quotePair.outAmount && new BigNumber(nextProps.quotePair.outAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (this.state.buyTab && !this.state.toCC) {
        this.setState({
          cln: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18).toFixed(5),
          loading: false,
          slippage: nextProps.buyQuotePair.slippage && new BigNumber(nextProps.buyQuotePair.slippage).toFixed(10),
          maxAmountError: nextProps.buyQuotePair.inAmount && new BigNumber(nextProps.buyQuotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (!this.state.buyTab && this.state.toCC) {
        this.setState({
          cc: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18).toFixed(5),
          loading: false,
          slippage: nextProps.sellQuotePair.slippage && new BigNumber(nextProps.sellQuotePair.slippage).toFixed(10),
          //maxAmountError: nextProps.quotePair.outAmount && new BigNumber(nextProps.quotePair.outAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (!this.state.buyTab && !this.state.toCC) {
        this.setState({
          cln: new BigNumber(nextProps.sellQuotePair.outAmount).div(1e18).toFixed(5),
          loading: false,
          slippage: nextProps.sellQuotePair.slippage && new BigNumber(nextProps.sellQuotePair.slippage).toFixed(10),
          maxAmountError: nextProps.sellQuotePair.outAmount && new BigNumber(nextProps.sellQuotePair.outAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      }
    }
    if (nextState.buyTab !== this.state.buyTab) {
      this.setState({ cc: '', cln: '', loading: false, minimum: '', priceChange: '', priceLimit: '', slippage: '' })
    }
  }

  handleChangeTab = (type) => {
    this.setState({ buyTab: type === 'buy' })
  }

  handleAdvanced = () => {
    this.setState({ advanced: !this.state.advanced })
  }

  handleMinimum = (event) => {
    const minimum = event.target.value
    if (this.state.cln) {
      this.setState({
        minimum,
        priceChange: 100 - 100*(minimum/(this.state.buyTab ? this.state.cc : this.state.cln)),
        priceLimit: this.state.cln/minimum
      })
    } //else error
  }
  handlePriceChange = (event) => {
    const priceChange = event.target.value
    if (this.state.cln) {
      this.setState({
        priceChange,
        minimum: (-1)*((priceChange - 100)*this.state.cc)/100,
        priceLimit: this.state.cln/((-1)*((priceChange - 100)*this.state.cc/100))
      })
    } //else error
  }
  handlePriceLimit = (event) => {
    const priceLimit = event.target.value
    if (this.state.cln) {
      this.setState({
        minimum: this.state.cln/priceLimit,
        priceChange: 100 - 100*(this.state.cln/priceLimit)/this.state.cc,
        priceLimit
      })
    } //else error
  }

  render () {
    const buyTabClass = classNames({
      "buy-tab": true,
      "active": this.state.buyTab
    })
    const sellTabClass = classNames({
      "buy-tab": true,
      "active": !this.state.buyTab
    })
    const advancedClass = classNames({
      "advanced-settings": true,
      "open": this.state.advanced
    })
    const maxAmountClass = classNames({
      "max-amount": true,
      "error": this.state.maxAmountError
    })
    const buySellInputClass = classNames({
      "buy-sell-input": true,
      "error": this.state.maxAmountError
    })
    const ccSymbol = this.props.community && this.props.community.symbol
    const ccPrice = this.props.community && this.props.community.currentPrice
    const formattedPrice = (this.props.quotePair.price && formatMoney(this.props.quotePair.price, 5, '.', ',')) || formatMoney(formatAmountReal(ccPrice, 18), 5, '.', ',')
    const clnBalance = this.props.web3.accountAddress && this.props.clnToken && this.props.clnToken.balanceOf && formatMoney(new BigNumber(this.props.clnToken.balanceOf).div(1e18))

    return (
      <div>
        <div className="buy-sell-top">
          <div className="buy-sell-tab">
            <div className={buyTabClass} onClick={this.handleChangeTab.bind(this, 'buy')}>BUY</div>
            <div className={sellTabClass} onClick={this.handleChangeTab.bind(this, 'sell')}>SELL</div>
          </div>
          <TextInput id="in-amount"
            type="number"
            className={buySellInputClass}
            placeholder={'Enter amount in ' + (this.state.buyTab ? 'CLN' : ccSymbol)}
            value={this.state.buyTab ? this.state.cln : this.state.cc}
            onChange={this.state.buyTab ? this.handleCLNInput : this.handleCCInput}
            error={this.state.maxAmountError}
          />
          <div className='input-coin-symbol'>{this.state.buyTab ? 'CLN' : ccSymbol}</div>
          <div className={maxAmountClass}>{'Max: ' + clnBalance + ' CLN'}</div>
        </div>
        <div className="arrows"><img src={Arrows} /></div>
        <div className="buy-sell-bottom">
          <div className="info-price">
            <div className="cc-to-cln">{'1 ' + ccSymbol + " = " + formattedPrice + " CLN"}</div>
            {this.state.slippage ? <div>PRICE SLIPPAGE<img src={Info} />{this.state.slippage+'%'}</div> : null}
          </div>
          <TextInput id="out-amount"
            type="number"
            className="buy-sell-input"
            placeholder={'Enter amount in ' + (this.state.buyTab ? ccSymbol : 'CLN')}
            value={this.state.buyTab ? this.state.cc : this.state.cln}
            onChange={this.state.buyTab ? this.handleCCInput : this.handleCLNInput}
          />
          <div className='input-coin-symbol'>{this.state.buyTab ? ccSymbol : 'CLN'}</div>
          <div className={advancedClass}>
            <div className="advanced-header">
              <h5 onClick={this.handleAdvanced}>Advanced settings</h5>
              <img onClick={this.handleAdvanced} src={DownArrow} />
            </div>
            <TextInput id="minimum"
              type="number"
              label="MINIMAL ACCEPTABLE AMOUNT"
              placeholder={"Enter minimal amount of " + ccSymbol}
              onChange={this.handleMinimum}
              value={this.state.minimum}
            />
            <TextInput id="price-change"
              type="number"
              label={ccSymbol + ' PRICE CHANGE'}
              placeholder="Enter price change in %"
              value={this.state.priceChange}
              onChange={this.handlePriceChange}
            />
            <TextInput id="price-limit"
              type="number"
              label={ccSymbol + ' PRICE LIMIT'}
              placeholder={"Enter price limit for " + ccSymbol}
              value={this.state.priceLimit}
              onChange={this.handlePriceLimit}
            />
            <p className="annotation">{'The transaction will fail if the price of 1 ' + ccSymbol + ' is ' + (this.state.buyTab ? 'higher' : 'lower') + ' than ' + (this.state.priceLimit || ccPrice) + ' CLN'}</p>
          </div>
          <button disabled={this.state.maxAmountError || !this.state.cln || this.state.loading} onClick={this.next}>{this.state.buyTab ? 'Buy ' + ccSymbol: 'Sell ' + ccSymbol}</button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  buyQuote: bindActionCreators(buyQuote, dispatch),
  sellQuote: bindActionCreators(sellQuote, dispatch),
  invertBuyQuote: bindActionCreators(invertBuyQuote, dispatch),
  invertSellQuote: bindActionCreators(invertSellQuote, dispatch),
  estimateGasBuyCc: bindActionCreators(estimateGasBuyCc, dispatch),
  estimateGasSellCc: bindActionCreators(estimateGasSellCc, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: getSelectedCommunity(state),
  quotePair: state.marketMaker.quotePair || {},
  buyQuotePair: state.marketMaker.buyQuote || {},
  sellQuotePair: state.marketMaker.sellQuote || {},
  web3: state.web3,
  isBuy: state.ui.isBuy,
  cln: state.ui.cln,
  cc: state.ui.cc,
  clnToken: getClnToken(state)
})

export default connect(mapStateToProps, mapDispatchToProps)(BuySellAmounts)
