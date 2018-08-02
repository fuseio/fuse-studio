import React, {Component, Fragment} from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import * as marketMakerActions from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import { buySell } from 'constants/uiConstants'

import TextInput from 'components/TextInput'
import Loader from 'components/Loader'
import { BigNumber } from 'bignumber.js'
import DownArrow from 'images/down-arrow.png'
import Arrows from 'images/arrows.png'
import Info from 'images/info.png'

const CcTextInput = (props) => {
  const {community, error, isLoading} = props
  const ccSymbol = community.symbol

  return (
    <Fragment>
      <TextInput id='cc-amount'
        className={classNames({'buy-sell-input': true, 'error': !!error})}
        placeholder={isLoading ? '' : `Enter amount in ${ccSymbol}`}
        error={error}
        value={isLoading ? '' : props.getValue()}
        onChange={props.handleInput}
      />
      {isLoading ? <Loader className='loader input' /> : null}
      <div className='input-coin-symbol'>{ccSymbol}</div>
    </Fragment>
  )
}

const ClnTextInput = (props) => {
  const {isLoading, error} = props

  return (
    <Fragment>
      <TextInput id='cln-amount'
        className={classNames({'buy-sell-input': true, 'error': !!error})}
        placeholder={isLoading ? '' : `Enter amount in CLN`}
        error={error}
        value={isLoading ? '' : props.getValue()}
        onChange={props.handleInput}
      />
      {isLoading ? <Loader className='loader input' /> : null}
      <div className='input-coin-symbol'>CLN</div>
    </Fragment>
  )
}

class BuySellAmounts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      toCC: true,
      inputField: 'cln',
      advancedInputField: 'priceChange',
      advanced: false,
      cln: this.props.cln || '',
      cc: this.props.cc || '',
      priceChange: this.props.priceChange || (this.props.isBuy === true ? buySell.DEFAULT_PRICE_CHANGE : buySell.DEFAULT_PRICE_CHANGE * (-1)) // in percent
    }
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

  handleClnInput = (event) => {
    const { isBuy, community, marketMakerActions, clnBalance } = this.props
    const cln = new BigNumber(event.target.value).multipliedBy(1e18)

    this.setState({
      cln: event.target.value,
      cc: '',
      toCC: true,
      inputField: 'cln',
      maxAmountError: cln.isGreaterThan(clnBalance) ? 'Insufficient Funds' : undefined
    })
    if (isBuy) {
      marketMakerActions.buyQuote(community.address, cln)
    } else {
      marketMakerActions.invertSellQuote(community.address, cln)
    }
  }

  handleCcInput = (event) => {
    const { isBuy, community, marketMakerActions } = this.props
    const cc = new BigNumber(event.target.value).multipliedBy(1e18)

    this.setState({
      cc: event.target.value,
      toCC: false,
      inputField: 'cc'
    })

    if (isBuy) {
      marketMakerActions.invertBuyQuote(community.address, cc)
    } else {
      marketMakerActions.sellQuote(community.address, cc)
    }
  }

  handleClickMax = (handle, balance) => {
    handle({
      target: {
        value: new BigNumber(balance).div(1e18)
      }
    })
  }

  handleClnClickMax = () => this.handleClickMax(this.handleClnInput, this.props.clnBalance)

  handleCcClickMax = () => this.handleClickMax(this.handleCcInput, this.props.ccBalance)

  price = () => {
    return this.props.quotePair.price
      ? new BigNumber(this.props.quotePair.price.toString())
      : new BigNumber(this.props.community.currentPrice.toString()).multipliedBy(1e18)
  }

  cln = () => {
    return this.state.inputField === 'cln' ? this.state.cln : (
      this.props.isBuy ? new BigNumber(this.props.quotePair.inAmount || 0).div(1e18).toFixed(5)
        : new BigNumber(this.props.quotePair.outAmount || 0).div(1e18).toFixed(5, 1)
    )
  }

  cc = () => {
    return this.state.inputField === 'cc' ? this.state.cc : (
      this.props.isBuy ? new BigNumber(this.props.quotePair.outAmount || 0).div(1e18).toFixed(5)
        : new BigNumber(this.props.quotePair.inAmount || 0).div(1e18).toFixed(5, 1)
    )
  }

  slippage = () => new BigNumber(this.props.quotePair.slippage || 0).multipliedBy(100).toFixed(5)

  priceLimit = () => this.state.advancedInputField === 'priceLimit' ? this.state.priceLimit
    : (1 + this.priceChange() / 100) * this.price()

  minimum = () => this.state.advancedInputField === 'minimum'
    ? this.state.minimum
    : (this.props.isBuy ? this.cc() : this.cln()) / (1 + this.priceChange() / 100)

  priceChange = () => this.state.advancedInputField === 'priceChange'
    ? this.state.priceChange
    : (this.props.isBuy ? this.cc() : this.cln()) / this.minimum()

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
    const minimum = event.target.value
    this.setState({
      advancedInputField: 'minimum',
      minimum
    })
  }

  handlePriceChange = (event) => {
    this.setState({
      advancedInputField: 'priceChange',
      priceChange: event.target.value
    })
  }

  handlePriceLimit = (event) => {
    this.setState({
      advancedInputField: 'priceLimit',
      priceLimit: event.target.value
    })
  }

  renderClickMax = () => {
    const maxAmountClass = classNames({
      'max-amount': true,
      'error': this.state.maxAmountError
    })

    if (this.props.isBuy) {
      const clnBalance = new BigNumber(this.props.clnBalance).div(1e18).toFormat(5, 1)
      return <div className={maxAmountClass} onClick={this.handleClnClickMax}>{`Max: ${clnBalance} CLN`}</div>
    } else {
      const ccBalance = new BigNumber(this.props.ccBalance).div(1e18).toFormat(5, 1)
      const ccSymbol = this.props.community.symbol
      return <div className={maxAmountClass} onClick={this.handleCcClickMax}>{`Max: ${ccBalance} ${ccSymbol}`}</div>
    }
  }

  render () {
    const { isBuy, community, isFetching } = this.props
    const { advanced, maxAmountError, toCC } = this.state
    const ccSymbol = community.symbol
    const ccPrice = community.currentPrice

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

    return (
      <div>
        <div className='buy-sell-top'>
          <div className='buy-sell-tab'>
            <div className={buyTabClass} onClick={this.handleChangeToBuyTab}>BUY</div>
            <div className={sellTabClass} onClick={this.handleChangeToSellTab}>SELL</div>
          </div>
          {
            isBuy ? <ClnTextInput
              isLoading={isFetching && !toCC}
              getValue={this.cln}
              handleInput={this.handleClnInput}
              error={maxAmountError} />
              : <CcTextInput
                isLoading={isFetching && toCC}
                community={community}
                getValue={this.cc}
                handleInput={this.handleCcInput}
                error={maxAmountError}
              />
          }
          {this.renderClickMax()}
        </div>
        <div className='arrows'><img src={Arrows} /></div>
        <div className='buy-sell-bottom'>
          <div className='info-price'>
            <div className='cc-to-cln'>{`1 ${ccSymbol} = ${this.price().toFixed(5)} CLN`}</div>
            {this.slippage() ? <div>PRICE SLIPPAGE<img src={Info} />{`${this.slippage()}%`}</div> : null}
          </div>
          {
            !isBuy ? <ClnTextInput
              isLoading={isFetching && !toCC}
              getValue={this.cln}
              handleInput={this.handleClnInput} />
              : <CcTextInput
                isLoading={isFetching && toCC}
                community={community}
                getValue={this.cc}
                handleInput={this.handleCcInput}
              />
          }
          <div className={advancedClass}>
            <div className='advanced-header'>
              <h5 onClick={this.handleAdvanced}>Advanced settings</h5>
              <img onClick={this.handleAdvanced} src={DownArrow} />
            </div>
            <TextInput id='minimum'
              type='number'
              label='MINIMAL ACCEPTABLE AMOUNT'
              placeholder={`Enter minimal amount of ${isBuy ? ccSymbol : 'cln'}`}
              onChange={this.handleMinimum}
              value={this.minimum()}
            />
            <div className='minimum-coin-symbol'>{isBuy ? ccSymbol : 'CLN'}</div>
            <TextInput id='price-change'
              type='number'
              label={`${ccSymbol} PRICE CHANGE`}
              placeholder='Enter price change in %'
              value={this.priceChange()}
              onChange={this.handlePriceChange}
            />
            <div className='price-change-percent'>%</div>
            <TextInput id='price-limit'
              type='number'
              label={`${ccSymbol} PRICE LIMIT`}
              placeholder={`Enter price limit for ${ccSymbol}`}
              value={this.priceLimit()}
              onChange={this.handlePriceLimit}
            />
            <div className='price-limit-cln'>CLN</div>
            <p className='annotation'>{`The transaction will fail if the price of 1 ${ccSymbol} is ${(isBuy ? 'higher' : 'lower')} than ${(this.priceLimit() || ccPrice)} CLN`}</p>
          </div>
          <button disabled={maxAmountError || isFetching || !this.cc() || !this.cln()} onClick={this.next}>{isBuy ? `Buy ${ccSymbol}` : `Sell ${ccSymbol}`}</button>
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
  quotePair: state.marketMaker.quotePair || {},
  isFetching: state.marketMaker.quotePair && state.marketMaker.quotePair.isFetching,
  ...props
})

export default connect(mapStateToProps, mapDispatchToProps)(BuySellAmounts)
