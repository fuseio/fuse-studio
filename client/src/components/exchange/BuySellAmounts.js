import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import * as uiActions from 'actions/ui'
import { buyQuote, sellQuote, invertBuyQuote, invertSellQuote, invertQuote, buyCc, sellCc } from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import { formatAmountReal, formatMoney } from 'services/global'
import { getSelectedCommunity, getClnToken } from 'selectors/basicToken'
import { buySell } from 'constants/uiConstants'

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
    advanced: false,
    priceChange: this.props.priceChange || (this.props.isBuy === true || this.props.isBuy !== false) ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE*(-1), //in percent
  }

  componentWillMount () {
    const currentPrice = this.props.community && this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)
    
    if (this.props.isBuy === true || this.props.isBuy === false) {
      this.setState({
        buyTab: this.props.isBuy, 
        priceLimit: this.props.priceLimit || currentPrice.multipliedBy(1 + this.state.priceChange/100).toString(),
        minimum: this.props.minimum || ''
      })
    } else {
      this.setState({
        buyTab: true,
        priceLimit: this.props.priceLimit || currentPrice.multipliedBy(1 + this.state.priceChange/100).toString(),
        minimum: this.props.minimum || ''
      })
    }
  }

  next = () => {
    this.props.uiActions.setBuyStage(2)
    this.props.uiActions.setBuySellAmounts({
      ccAddress: this.props.community.address,
      cln: this.state.cln.toString(),
      cc: this.state.cc.toString(),
      isBuy: this.state.buyTab,
      minimum: this.state.minimum,
      priceLimit: this.state.priceLimit,
      priceChange: this.state.priceChange
    })
  }

  handleCLNInput = (event) => {
    const cln = event.target.value ? new BigNumber(event.target.value).multipliedBy(1e18) : 0
    const clnBalance = this.props.web3.account && this.props.clnToken && this.props.clnToken.balanceOf && new BigNumber(this.props.clnToken.balanceOf)

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
    const priceChange = this.state.priceChange
    const price = this.props.quotePair.price ? this.props.quotePair.price : new BigNumber(this.props.community && this.props.community.currentPrice && this.props.community.currentPrice.toString()).multipliedBy(1e18)
    const priceLimit = this.props.quotePair.price ? price*(1 + priceChange/100) : price.multipliedBy(1 + priceChange/100)
    const clnBalance = this.props.web3.account && this.props.clnToken && this.props.clnToken.balanceOf && new BigNumber(this.props.clnToken.balanceOf)
    const ccBalance = this.props.web3.account && this.props.community && this.props.community.balanceOf && new BigNumber(this.props.community.balanceOf)

    if (!isEqual(nextProps.buyQuotePair, this.props.buyQuotePair) || !isEqual(nextProps.sellQuotePair, this.props.sellQuotePair)) {
      if (this.state.buyTab && this.state.toCC) {
        BigNumber.config({ DECIMAL_PLACES: 5, ROUNDING_MODE: 1 }) //round down
        this.setState({
          cc: new BigNumber(nextProps.buyQuotePair.outAmount).div(1e18),
          loading: false,
          minimum: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18)/priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.buyQuotePair.slippage && new BigNumber(nextProps.buyQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.buyQuotePair.inAmount && new BigNumber(nextProps.buyQuotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (this.state.buyTab && !this.state.toCC) {
        BigNumber.config({ DECIMAL_PLACES: 5, ROUNDING_MODE: 4 }) //round up
        this.setState({
          cln: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18),
          loading: false,
          minimum: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18)/priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.buyQuotePair.slippage && new BigNumber(nextProps.buyQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.buyQuotePair.inAmount && new BigNumber(nextProps.buyQuotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (!this.state.buyTab && this.state.toCC) {
        BigNumber.config({ DECIMAL_PLACES: 5, ROUNDING_MODE: 4 }) //round up
        this.setState({
          cc: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18),
          loading: false,
          minimum: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18)*priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.sellQuotePair.slippage && new BigNumber(nextProps.sellQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.sellQuotePair.inAmount && new BigNumber(nextProps.sellQuotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
        })
      } else if (!this.state.buyTab && !this.state.toCC) {
        BigNumber.config({ DECIMAL_PLACES: 5, ROUNDING_MODE: 1 }) //round down
        this.setState({
          cln: new BigNumber(nextProps.sellQuotePair.outAmount).div(1e18),
          loading: false,
          minimum: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18)*priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.sellQuotePair.slippage && new BigNumber(nextProps.sellQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.sellQuotePair.inAmount && new BigNumber(nextProps.sellQuotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
        })
      }
    } else {
      if (nextState.buyTab !== this.state.buyTab) {
        const currentPrice = nextProps.community && nextProps.community.currentPrice && new BigNumber(nextProps.community.currentPrice.toString()).multipliedBy(1e18)
        const nextPriceChange = nextState.buyTab ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE*(-1)
        this.setState({
          cc: '',
          cln: '',
          loading: false,
          maxAmountError: '',
          minimum: '',
          priceChange: nextPriceChange,
          priceLimit: currentPrice.multipliedBy(1 + nextPriceChange/100).toString(),
          slippage: ''
        })
      }
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
    const price = this.props.quotePair.price ? this.props.quotePair.price : new BigNumber(this.props.community && this.props.community.currentPrice && this.props.community.currentPrice.toString()).multipliedBy(1e18)
    let priceChange, priceLimit
    if (this.state.buyTab) {
      priceChange = this.state.cln ? (100*(this.state.cln/minimum - price))/price : ''
      priceLimit = this.state.cln ? this.state.cln/minimum : ''
    } else {
      priceChange = this.state.cc ? (100*(minimum/this.state.cc - price))/price : ''
      priceLimit = this.state.cc ? minimum/this.state.cc : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit
    })
  }
  handlePriceChange = (event) => {
    const priceChange = event.target.value
    const price = this.props.quotePair.price ? this.props.quotePair.price : new BigNumber(this.props.community && this.props.community.currentPrice && this.props.community.currentPrice.toString()).multipliedBy(1e18)
    const priceLimit = this.props.quotePair.price ? price*(1 + priceChange/100) : price.multipliedBy(1 + priceChange/100)
    let minimum
    if (this.state.buyTab) {
      minimum = this.state.cln ? this.state.cln/priceLimit : ''
    } else {
      minimum = this.state.cc ? this.state.cc*priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit: priceLimit.toString()
    })
  }
  handlePriceLimit = (event) => {
    const priceLimit = event.target.value
    const price = this.props.quotePair.price ? this.props.quotePair.price : new BigNumber(this.props.community && this.props.community.currentPrice && this.props.community.currentPrice.toString()).multipliedBy(1e18)
    let minimum
    if (this.state.buyTab) {
      minimum = this.state.cln ? this.state.cln/priceLimit : ''
    } else {
      minimum = this.state.cc ? this.state.cc*priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange: (100*(priceLimit - price))/price,
      priceLimit
    })
  }
  handleClickMax = () => {
    const clnBalance = this.props.web3.account && this.props.clnToken && this.props.clnToken.balanceOf && new BigNumber(this.props.clnToken.balanceOf)
    const ccBalance = this.props.web3.account && this.props.community && this.props.community.balanceOf && new BigNumber(this.props.community.balanceOf)

    if (this.state.buyTab) {
      this.setState({
        cln: clnBalance.div(1e18),
        toCC: true,
        loading: true,
      })

      this.props.buyQuote(this.props.community.address, clnBalance)
      
    } else {
      this.setState({
        cc: ccBalance.div(1e18),
        toCC: false,
        loading: true
      })
      this.props.sellQuote(this.props.community.address, ccBalance)
    }
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
    const formattedPrice = this.props.quotePair.price ? this.props.quotePair.price : new BigNumber(this.props.community && this.props.community.currentPrice && this.props.community.currentPrice.toString()).multipliedBy(1e18)
    BigNumber.config({ DECIMAL_PLACES: 5, ROUNDING_MODE: 1 }) //round down
    const clnBalance = this.props.web3.account && this.props.clnToken && this.props.clnToken.balanceOf && new BigNumber(this.props.clnToken.balanceOf).div(1e18).toFormat(5)
    const ccBalance = this.props.web3.account && this.props.community && this.props.community.balanceOf && new BigNumber(this.props.community.balanceOf).div(1e18).toFormat(5)
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
          <div className={maxAmountClass} onClick={this.handleClickMax}>{'Max: ' + (this.state.buyTab ? (clnBalance + ' CLN') : (ccBalance + ' ' + ccSymbol))}</div>
        </div>
        <div className="arrows"><img src={Arrows} /></div>
        <div className="buy-sell-bottom">
          <div className="info-price">
            <div className="cc-to-cln">{'1 ' + ccSymbol + " = " + formattedPrice.toFixed(5) + " CLN"}</div>
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
              placeholder={"Enter minimal amount of " + (this.state.buyTab ? ccSymbol : 'CLN')}
              onChange={this.handleMinimum}
              value={this.state.minimum}
            />
            <div className='minimum-coin-symbol'>{this.state.buyTab ? ccSymbol : 'CLN'}</div>
            <TextInput id="price-change"
              type="number"
              label={ccSymbol + ' PRICE CHANGE'}
              placeholder="Enter price change in %"
              value={this.state.priceChange}
              onChange={this.handlePriceChange}
            />
            <div className='price-change-percent'>%</div>
            <TextInput id="price-limit"
              type="number"
              label={ccSymbol + ' PRICE LIMIT'}
              placeholder={"Enter price limit for " + ccSymbol}
              value={this.state.priceLimit}
              onChange={this.handlePriceLimit}
            />
            <div className='price-limit-cln'>CLN</div>
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
  invertQuote: bindActionCreators(invertQuote, dispatch),
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
  priceChange: state.ui.priceChange,
  priceLimit: state.ui.priceLimit,
  minimum: state.ui.minimum,
  clnToken: getClnToken(state)
})

export default connect(mapStateToProps, mapDispatchToProps)(BuySellAmounts)
