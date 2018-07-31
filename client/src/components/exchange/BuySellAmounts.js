import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import isEqual from 'lodash/isEqual'
import * as uiActions from 'actions/ui'
import * as marketMakerActions from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
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
    const currentPrice = this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)

    this.setState({
      priceLimit: this.props.priceLimit || currentPrice.multipliedBy(1 + this.state.priceChange / 100).toString(),
      minimum: this.props.minimum || '',
      price: currentPrice.toFixed(5)
    })
  }

  next = () => {
    const { cln, cc, minimum, priceLimit, priceChange } = this.state
    const { isBuy, community, marketMakerActions, uiActions } = this.props

    if (isBuy) {
      marketMakerActions.estimateGasBuyCc(community.address, new BigNumber(cln).multipliedBy(1e18), minimum && new BigNumber(minimum.toString()).multipliedBy(1e18))
    } else {
      marketMakerActions.estimateGasSellCc(community.address, new BigNumber(cc).multipliedBy(1e18), minimum && new BigNumber(minimum.toString()).multipliedBy(1e18))
    }

    uiActions.setBuySellAmounts({
      buyStage: 2,
      ccAddress: community.address,
      cln: cln.toString(),
      cc: cc.toString(),
      isBuy,
      minimum,
      priceLimit,
      priceChange
    })
  }

  handleCLNInput = (event) => {
    const { isBuy, community, balances, addresses, marketMakerActions } = this.props
    const cln = new BigNumber(event.target.value).multipliedBy(1e18)
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork])

    this.setState({
      cln: event.target.value,
      cc: '',
      toCC: true,
      loading: true,
      maxAmountError: cln.isGreaterThan(clnBalance) ? 'Insufficient Funds' : undefined
    })
    if (isBuy) {
      marketMakerActions.buyQuote(community.address, cln)
    } else {
      marketMakerActions.invertSellQuote(community.address, cln)
    }
  }

  handleCCInput = (event) => {
    const { isBuy, community, marketMakerActions } = this.props
    const cc = new BigNumber(event.target.value).multipliedBy(1e18)

    this.setState({
      cc: event.target.value,
      cln: '',
      toCC: false,
      loading: true
    })

    if (isBuy) {
      marketMakerActions.invertBuyQuote(community.address, cc)
    } else {
      marketMakerActions.sellQuote(community.address, cc)
    }
  }

  price = () => {
    return new BigNumber(this.props.quotePair.price ? this.props.quotePair.price.toString()
      : this.props.community.currentPrice.toString())
  }

  componentWillReceiveProps = (nextProps, nextState) => {
    if (isEqual(nextProps.quotePair, this.props.quotePair)) {
      return
    }

    const { isBuy, community, balances, addresses } = this.props
    const { toCC, priceChange } = this.state
    const priceLimit = this.price().multipliedBy(1 + priceChange / 100)
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork])
    const ccBalance = balances[community.address] && new BigNumber(balances[community.address])
    const slippage = new BigNumber(nextProps.quotePair.slippage).multipliedBy(100).toFixed(5)

    if (isBuy && toCC) {
      this.setState({
        cc: new BigNumber(nextProps.quotePair.outAmount).div(1e18).toFixed(5, 1), // round down
        loading: false,
        price: this.price(),
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) / priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
      })
    } else if (isBuy && !toCC) {
      this.setState({
        cln: new BigNumber(nextProps.quotePair.inAmount).div(1e18).toFixed(5), // round up
        price: this.price(),
        loading: false,
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) / priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(clnBalance) && 'Insufficient Funds'
      })
    } else if (!isBuy && toCC) {
      this.setState({
        cc: new BigNumber(nextProps.quotePair.inAmount).div(1e18).toFixed(5), // round up
        price: this.price(),
        loading: false,
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) * priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
      })
    } else if (!isBuy && !toCC) {
      this.setState({
        cln: new BigNumber(nextProps.quotePair.outAmount).div(1e18).toFixed(5, 1), // round down
        price: this.price(),
        loading: false,
        minimum: new BigNumber(nextProps.quotePair.inAmount).div(1e18) * priceLimit,
        priceLimit: priceLimit.toString(),
        slippage,
        maxAmountError: nextProps.quotePair.inAmount && new BigNumber(nextProps.quotePair.inAmount).isGreaterThan(ccBalance) && 'Insufficient Funds'
      })
    }
  }

  handleChangeToSellTab = () => {
    if (this.props.isBuy) {
      this.handleChangeTab()
    }
  }

  handleChangeToBuyTab = () => {
    if (!this.props.isBuy) {
      this.handleChangeTab()
    }
  }

  handleChangeTab = () => {
    const currentPrice = this.props.community && this.props.community.currentPrice && new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)
    const priceChange = this.props.isBuy ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE * (-1)
    this.props.uiActions.setBuySellAmounts({
      cc: '',
      cln: '',
      isBuy: !this.props.isBuy,
      loading: false,
      maxAmountError: '',
      minimum: '',
      priceChange: priceChange,
      priceLimit: currentPrice.multipliedBy(1 + priceChange / 100).toString(),
      price: currentPrice.toFixed(5),
      slippage: ''
    })
  }

  handleAdvanced = () => {
    this.setState({ advanced: !this.state.advanced })
  }

  handleMinimum = (event) => {
    const { cln, cc } = this.state
    const { isBuy, community, quotePair } = this.props
    const minimum = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    let priceChange, priceLimit
    if (isBuy) {
      priceChange = cln ? (100 * (cln / minimum - price)) / price : ''
      priceLimit = cln ? cln / minimum : ''
    } else {
      priceChange = cc ? (100 * (minimum / cc - price)) / price : ''
      priceLimit = cc ? minimum / cc : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit
    })
  }

  handlePriceChange = (event) => {
    const { cln, cc } = this.state
    const { isBuy, community, quotePair } = this.props
    const priceChange = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    const priceLimit = quotePair.price ? price * (1 + priceChange / 100) : price.multipliedBy(1 + priceChange / 100)
    let minimum
    if (isBuy) {
      minimum = cln ? cln / priceLimit : ''
    } else {
      minimum = cc ? cc * priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange,
      priceLimit: priceLimit.toString()
    })
  }

  handlePriceLimit = (event) => {
    const { cln, cc } = this.state
    const { isBuy, community, quotePair } = this.props
    const priceLimit = event.target.value
    const price = quotePair.price ? quotePair.price : new BigNumber(community && community.currentPrice && community.currentPrice.toString()).multipliedBy(1e18)
    let minimum
    if (isBuy) {
      minimum = cln ? cln / priceLimit : ''
    } else {
      minimum = cc ? cc * priceLimit : ''
    }
    this.setState({
      minimum,
      priceChange: (100 * (priceLimit - price)) / price,
      priceLimit
    })
  }
  handleClickMax = () => {
    const { isBuy, community, balances, addresses, marketMakerActions } = this.props
    const { cln, cc } = this.state
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork])
    const ccBalance = community && balances[community.address] && new BigNumber(balances[community.address])
    if (isBuy && cln.toString() !== clnBalance.div(1e18).toString()) {
      this.setState({
        cln: clnBalance.div(1e18),
        cc: '',
        toCC: true,
        loading: true
      })
      marketMakerActions.buyQuote(community.address, clnBalance)
    } else if (!isBuy && cc.toString() !== ccBalance.div(1e18).toString()) {
      this.setState({
        cc: ccBalance.div(1e18),
        cln: '',
        toCC: false,
        loading: true
      })
      marketMakerActions.sellQuote(community.address, ccBalance)
    }
  }

  inAmountTextInputProps = () => (
    this.textInputProps(this.props.isBuy)
  )

  outAmountTextInputProps = () => (
    this.textInputProps(!this.props.isBuy)
  )

  textInputProps = (isBuy) => (
    isBuy ? {
      value: this.state.cln,
      onChange: this.handleCLNInput
    } : {
      value: this.state.cc,
      onChange: this.handleCCInput
    }
  )

  render () {
    const { isBuy, community, balances, addresses } = this.props
    const { advanced, maxAmountError, cln, cc, price, slippage, minimum, priceChange, priceLimit, loading, toCC } = this.state
    const ccSymbol = community.symbol
    const ccPrice = community.currentPrice
    const clnBalance = balances[addresses.ColuLocalNetwork] && new BigNumber(balances[addresses.ColuLocalNetwork]).div(1e18).toFormat(5, 1)
    const ccBalance = community && balances[community.address] && new BigNumber(balances[community.address]).div(1e18).toFormat(5, 1)

    const buyTabClass = classNames({
      'buy-tab': true,
      'active': isBuy
    })
    const sellTabClass = classNames({
      'buy-tab': true,
      'active': !isBuy
    })
    const advancedClass = classNames({
      'advanced-settings': true,
      'open': advanced
    })
    const maxAmountClass = classNames({
      'max-amount': true,
      'error': maxAmountError
    })
    const buySellInputClass = classNames({
      'buy-sell-input': true,
      'error': maxAmountError
    })

    return (
      <div>
        <div className='buy-sell-top'>
          <div className='buy-sell-tab'>
            <div className={buyTabClass} onClick={this.handleChangeToBuyTab}>BUY</div>
            <div className={sellTabClass} onClick={this.handleChangeToSellTab}>SELL</div>
          </div>
          <TextInput id='in-amount'
            className={buySellInputClass}
            placeholder={(isBuy && loading && !toCC) || (!isBuy && loading && toCC) ? '' : `Enter amount in ${isBuy ? 'CLN' : ccSymbol}`}
            error={maxAmountError}
            {...this.inAmountTextInputProps()}
          />
          {(isBuy && loading && !toCC) || (!isBuy && loading && toCC) ? <Loader className='loader input' /> : null}
          <div className='input-coin-symbol'>{isBuy ? 'CLN' : ccSymbol}</div>
          <div className={maxAmountClass} onClick={this.handleClickMax}>{`Max: ${isBuy ? clnBalance + ' CLN' : ccBalance + ' ' + ccSymbol}`}</div>
        </div>
        <div className='arrows'><img src={Arrows} /></div>
        <div className='buy-sell-bottom'>
          <div className='info-price'>
            <div className='cc-to-cln'>{`1 ${ccSymbol} = ${price} CLN`}</div>
            {slippage ? <div>PRICE SLIPPAGE<img src={Info} />{`${slippage}%`}</div> : null}
          </div>
          <TextInput id='out-amount'
            className='buy-sell-input'
            placeholder={(isBuy && loading && toCC) || (!isBuy && loading && !toCC) ? '' : `Enter amount in ${isBuy ? ccSymbol : 'CLN'}`}
            {...this.outAmountTextInputProps()}
          />
          {(isBuy && loading && toCC) || (!isBuy && loading && !toCC) ? <Loader className='loader input' /> : null}
          <div className='input-coin-symbol'>{isBuy ? ccSymbol : 'CLN'}</div>
          <div className={advancedClass}>
            <div className='advanced-header'>
              <h5 onClick={this.handleAdvanced}>Advanced settings</h5>
              <img onClick={this.handleAdvanced} src={DownArrow} />
            </div>
            <TextInput id='minimum'
              type='number'
              label='MINIMAL ACCEPTABLE AMOUNT'
              placeholder={`Enter minimal amount of ${isBuy ? ccSymbol : 'CLN'}`}
              onChange={this.handleMinimum}
              value={minimum}
            />
            <div className='minimum-coin-symbol'>{isBuy ? ccSymbol : 'CLN'}</div>
            <TextInput id='price-change'
              type='number'
              label={`${ccSymbol} PRICE CHANGE`}
              placeholder='Enter price change in %'
              value={priceChange}
              onChange={this.handlePriceChange}
            />
            <div className='price-change-percent'>%</div>
            <TextInput id='price-limit'
              type='number'
              label={`${ccSymbol} PRICE LIMIT`}
              placeholder={`Enter price limit for ${ccSymbol}`}
              value={priceLimit}
              onChange={this.handlePriceLimit}
            />
            <div className='price-limit-cln'>CLN</div>
            <p className='annotation'>{`The transaction will fail if the price of 1 ${ccSymbol} is ${(isBuy ? 'higher' : 'lower')} than ${(priceLimit || ccPrice)} CLN`}</p>
          </div>
          <button disabled={maxAmountError || !cln || cln === 0 || cc === 0 || loading} onClick={this.next}>{isBuy ? `Buy ${ccSymbol}` : `Sell ${ccSymbol}`}</button>
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
  quotePair: state.marketMaker.quotePair || {},
  ...props
})

export default connect(mapStateToProps, mapDispatchToProps)(BuySellAmounts)
