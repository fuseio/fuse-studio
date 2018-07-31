import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import * as uiActions from 'actions/ui'
import * as marketMakerActions from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import { formatAmountReal, formatMoney } from 'services/global'
import { getSelectedCommunity, getClnToken } from 'selectors/basicToken'
import { buySell } from 'constants/uiConstants'
import {getBalances} from 'selectors/accounts'
import {getAddresses} from 'selectors/web3'

import TextInput from 'components/TextInput'
import Loader from 'components/Loader'
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
    priceChange: this.props.priceChange || (this.props.isBuy === true || this.props.isBuy !== false) ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE * (-1) // in percent
  }

  componentWillMount () {
    const currentPrice = this.props.community && this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)

    this.setState({
      buyTab: this.props.isBuy,
      priceLimit: this.props.priceLimit || currentPrice.multipliedBy(1 + this.state.priceChange/100).toString(),
      minimum: this.props.minimum || '',
      price: currentPrice.toFixed(5)
    })
  }

  next = () => {
    const { buyTab, cln, cc, minimum, priceLimit, priceChange } = this.state
    const { community, marketMakerActions, uiActions } = this.props

    if (buyTab) {
      marketMakerActions.estimateGasBuyCc(community.address, new BigNumber(cln).multipliedBy(1e18), minimum && new BigNumber(minimum.toString()).multipliedBy(1e18))
    } else {
      marketMakerActions.estimateGasSellCc(community.address, new BigNumber(cc).multipliedBy(1e18), minimum && new BigNumber(minimum.toString()).multipliedBy(1e18))
    }

    uiActions.setBuyStage(2)
    uiActions.setBuySellAmounts({
      ccAddress: community.address,
      cln: cln.toString(),
      cc: cc.toString(),
      isBuy: buyTab,
      minimum: minimum,
      priceLimit: priceLimit,
      priceChange: priceChange
    })
  }

  handleCLNInput = (event) => {
    const { community, balances, addresses, marketMakerActions } = this.props
    const cln = event.target.value ? new BigNumber(event.target.value).multipliedBy(1e18) : 0
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork])
    const currentPrice = new BigNumber(community.currentPrice.toString()).multipliedBy(1e18).toFixed(5)

    if (event.target.value !== this.state.cln) {
      this.setState({
        cln: event.target.value,
        cc: '',
        toCC: true,
        price: event.target.value == 0 ? currentPrice : this.state.price,
        slippage: 0,
        loading: event.target.value != 0,
        maxAmountError: cln && cln.isGreaterThan(clnBalance) && 'Insufficient Funds'
      })
      if (this.state.buyTab && event.target.value != 0) {
        marketMakerActions.buyQuote(community.address, cln)
      } else if (event.target.value != 0) {
        marketMakerActions.invertSellQuote(community.address, cln)
      }
    }
  }

  handleCCInput = (event) => {
    const { community, marketMakerActions } = this.props
    const cc = event.target.value ? new BigNumber(event.target.value).multipliedBy(1e18) : 0
    const currentPrice = new BigNumber(community.currentPrice.toString()).multipliedBy(1e18).toFixed(5)

    if (event.target.value !== this.state.cc) {
      this.setState({
        cc: event.target.value,
        cln: '',
        toCC: false,
        price: event.target.value == 0 ? currentPrice : this.state.price,
        slippage: 0,
        loading: event.target.value != 0
      })
      if (this.state.buyTab && event.target.value != 0) {
        marketMakerActions.invertBuyQuote(community.address, cc)
      } else if (event.target.value != 0) {
        marketMakerActions.sellQuote(community.address, cc)
      }
    }
  }

  componentWillReceiveProps = (nextProps, nextState) => {
    const { community, quotePair, balances, addresses, buyQuotePair, sellQuotePair } = this.props
    const { buyTab, toCC, priceChange, loading } = this.state
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    const priceLimit = quotePair.price ? price * (1 + priceChange / 100) : price.multipliedBy(1 + priceChange / 100)
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork])
    const ccBalance = community && balances[community.address] && new BigNumber(balances[community.address])
    if (!isEqual(nextProps.buyQuotePair, buyQuotePair) || !isEqual(nextProps.sellQuotePair, sellQuotePair)) {
      if (buyTab && toCC) {
        this.setState({
          cc: new BigNumber(nextProps.buyQuotePair.outAmount).div(1e18).toFixed(5, 1),//round down
          loading: false,
          price: nextProps.buyQuotePair.price,
          minimum: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18)/priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.buyQuotePair.slippage && new BigNumber(nextProps.buyQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.buyQuotePair.inAmount && new BigNumber(nextProps.buyQuotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (buyTab && !toCC) {
        this.setState({
          cln: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18).toFixed(5),//round up
          price: nextProps.buyQuotePair.price,
          loading: false,
          minimum: new BigNumber(nextProps.buyQuotePair.inAmount).div(1e18)/priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.buyQuotePair.slippage && new BigNumber(nextProps.buyQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.buyQuotePair.inAmount && new BigNumber(nextProps.buyQuotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
        })
      } else if (!buyTab && toCC) {
        this.setState({
          cc: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18).toFixed(5),//round up
          price: nextProps.sellQuotePair.price,
          loading: false,
          minimum: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18)*priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.sellQuotePair.slippage && new BigNumber(nextProps.sellQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.sellQuotePair.inAmount && new BigNumber(nextProps.sellQuotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
        })
      } else if (!buyTab && !toCC) {
        this.setState({
          cln: new BigNumber(nextProps.sellQuotePair.outAmount).div(1e18).toFixed(5, 1),//round down
          price: nextProps.sellQuotePair.price,
          loading: false,
          minimum: new BigNumber(nextProps.sellQuotePair.inAmount).div(1e18)*priceLimit,
          priceLimit: priceLimit.toString(),
          slippage: nextProps.sellQuotePair.slippage && new BigNumber(nextProps.sellQuotePair.slippage).multipliedBy(100).toFixed(5),
          maxAmountError: nextProps.sellQuotePair.inAmount && new BigNumber(nextProps.sellQuotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
        })
      }
    }
  }

  handleChangeTab = (type) => {
    const currentPrice = this.props.community && this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)
    const priceChange = type === 'buy' ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE*(-1)
    this.setState({
      cc: '',
      cln: '',
      buyTab: type === 'buy',
      loading: false,
      maxAmountError: '',
      minimum: '',
      priceChange: priceChange,
      priceLimit: currentPrice.multipliedBy(1 + priceChange/100).toString(),
      price: currentPrice.toFixed(5),
      slippage: ''
    })
  }

  handleAdvanced = () => {
    this.setState({ advanced: !this.state.advanced })
  }

  handleMinimum = (event) => {
    const { buyTab, cln, cc } = this.state
    const { community, quotePair } = this.props
    const minimum = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    let priceChange, priceLimit
    if (buyTab) {
      priceChange = cln ? (100*(cln/minimum - price))/price : ''
      priceLimit = cln ? cln/minimum : ''
    } else {
      priceChange = cc ? (100*(minimum/cc - price))/price : ''
      priceLimit = cc ? minimum/cc : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit
    })
  }
  handlePriceChange = (event) => {
    const { buyTab, cln, cc } = this.state
    const { community, quotePair } = this.props
    const priceChange = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    const priceLimit = quotePair.price ? price*(1 + priceChange/100) : price.multipliedBy(1 + priceChange/100)
    let minimum
    if (buyTab) {
      minimum = cln ? cln/priceLimit : ''
    } else {
      minimum =cc ? cc*priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit: priceLimit.toString()
    })
  }
  handlePriceLimit = (event) => {
    const { buyTab, cln, cc } = this.state
    const { community, quotePair } = this.props
    const priceLimit = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    let minimum
    if (buyTab) {
      minimum = cln ? cln/priceLimit : ''
    } else {
      minimum = cc ? cc*priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange: (100*(priceLimit - price))/price,
      priceLimit
    })
  }
  handleClickMax = () => {
    const { community, balances, addresses, marketMakerActions } = this.props
    const { buyTab, cln, cc } = this.state
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork])
    const ccBalance = community && balances[community.address] && new BigNumber(balances[community.address])
    if (buyTab && cln.toString() !== clnBalance.div(1e18).toString()) {
      this.setState({
        cln: clnBalance.div(1e18),
        cc: '',
        toCC: true,
        loading: true
      })
      marketMakerActions.buyQuote(community.address, clnBalance)
    } else if (!buyTab && cc.toString() !== ccBalance.div(1e18).toString()) {
      this.setState({
        cc: ccBalance.div(1e18),
        cln: '',
        toCC: false,
        loading: true
      })
      marketMakerActions.sellQuote(community.address, ccBalance)
    }
  }

  render () {
    const { community, quotePair, balances, addresses } = this.props
    const { buyTab, advanced, maxAmountError, cln, cc, price, slippage, minimum, priceChange, priceLimit, loading, toCC } = this.state
    const ccSymbol = community && community.symbol
    const ccPrice = community && community.currentPrice
    const formattedPrice = price
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork]).div(1e18).toFormat(5, 1)
    const ccBalance = community && balances[community.address] && new BigNumber(balances[community.address]).div(1e18).toFormat(5, 1)
    const buyTabClass = classNames({
      "buy-tab": true,
      "active": buyTab
    })
    const sellTabClass = classNames({
      "buy-tab": true,
      "active": !buyTab
    })
    const advancedClass = classNames({
      "advanced-settings": true,
      "open": advanced
    })
    const maxAmountClass = classNames({
      "max-amount": true,
      "error": maxAmountError
    })
    const buySellInputClass = classNames({
      "buy-sell-input": true,
      "error": maxAmountError
    })
    return (
      <div>
        <div className="buy-sell-top">
          <div className="buy-sell-tab">
            <div className={buyTabClass} onClick={this.handleChangeTab.bind(this, 'buy')}>BUY</div>
            <div className={sellTabClass} onClick={this.handleChangeTab.bind(this, 'sell')}>SELL</div>
          </div>
          <TextInput id="in-amount"
            className={buySellInputClass}
            placeholder={(buyTab && loading && !toCC) || (!buyTab && loading && toCC) ? '' : `Enter amount in ${buyTab ? 'CLN' : ccSymbol}`}
            value={buyTab ? cln : cc}
            onChange={buyTab ? this.handleCLNInput : this.handleCCInput}
            error={maxAmountError}
          />
          {(buyTab && loading && !toCC) || (!buyTab && loading && toCC) ? <Loader className="loader input" /> : null}
          <div className='input-coin-symbol'>{buyTab ? 'CLN' : ccSymbol}</div>
          <div className={maxAmountClass} onClick={this.handleClickMax}>{`Max: ${buyTab ? clnBalance + ' CLN' : ccBalance +' ' + ccSymbol}`}</div>
        </div>
        <div className="arrows"><img src={Arrows} /></div>
        <div className="buy-sell-bottom">
          <div className="info-price">
            <div className="cc-to-cln">{`1 ${ccSymbol} = ${formattedPrice} CLN`}</div>
            {slippage ? <div>PRICE SLIPPAGE<img src={Info} />{`${slippage}%`}</div> : null}
          </div>
          <TextInput id="out-amount"
            className="buy-sell-input"
            placeholder={(buyTab && loading && toCC) || (!buyTab && loading && !toCC) ? '': `Enter amount in ${buyTab ? ccSymbol : 'CLN'}`}
            value={buyTab ? cc : cln}
            onChange={buyTab ? this.handleCCInput : this.handleCLNInput}
          />
          {(buyTab && loading && toCC) || (!buyTab && loading && !toCC) ? <Loader className="loader input" /> : null}
          <div className='input-coin-symbol'>{buyTab ? ccSymbol : 'CLN'}</div>
          <div className={advancedClass}>
            <div className="advanced-header">
              <h5 onClick={this.handleAdvanced}>Advanced settings</h5>
              <img onClick={this.handleAdvanced} src={DownArrow} />
            </div>
            <TextInput id="minimum"
              type="number"
              label="MINIMAL ACCEPTABLE AMOUNT"
              placeholder={`Enter minimal amount of ${buyTab ? ccSymbol : 'CLN'}`}
              onChange={this.handleMinimum}
              value={minimum}
            />
            <div className='minimum-coin-symbol'>{buyTab ? ccSymbol : 'CLN'}</div>
            <TextInput id="price-change"
              type="number"
              label={`${ccSymbol} PRICE CHANGE`}
              placeholder="Enter price change in %"
              value={priceChange}
              onChange={this.handlePriceChange}
            />
            <div className='price-change-percent'>%</div>
            <TextInput id="price-limit"
              type="number"
              label={`${ccSymbol} PRICE LIMIT`}
              placeholder={`Enter price limit for ${ccSymbol}`}
              value={priceLimit}
              onChange={this.handlePriceLimit}
            />
            <div className='price-limit-cln'>CLN</div>
            <p className="annotation">{`The transaction will fail if the price of 1 ${ccSymbol} is ${(buyTab ? 'higher' : 'lower')} than ${(priceLimit || ccPrice)} CLN`}</p>
          </div>
          <button disabled={maxAmountError || !cln || cln == 0 || cc == 0 || loading} onClick={this.next}>{buyTab ? `Buy ${ccSymbol}` : `Sell ${ccSymbol}`}</button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  marketMakerActions: bindActionCreators(marketMakerActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  addresses: getAddresses(state),
  balances: getBalances(state),
  community: getSelectedCommunity(state),
  quotePair: state.marketMaker.quotePair || {},
  buyQuotePair: state.marketMaker.buyQuote || {},
  sellQuotePair: state.marketMaker.sellQuote || {},
  cln: state.ui.cln,
  cc: state.ui.cc,
  priceChange: state.ui.priceChange,
  priceLimit: state.ui.priceLimit,
  minimum: state.ui.minimum,
  clnToken: getClnToken(state),
  ...props
})

export default connect(mapStateToProps, mapDispatchToProps)(BuySellAmounts)
