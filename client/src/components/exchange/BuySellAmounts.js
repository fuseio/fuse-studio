import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'

import TextInput from 'components/TextInput'
import Loader from 'components/Loader'
import { BigNumber } from 'bignumber.js'
import DownArrow from 'images/down-arrow.png'
import Arrows from 'images/arrows.png'
import Info from 'images/info.png'

const DEFAULT_PRICE_CHANGE = 2
const ROUND_PRECISION = 5

const AmountTextInput = (props) => {
  const {symbol, error, isLoading} = props

  return (
    <Fragment>
      <TextInput
        className={classNames({'buy-sell-input': true, 'error': !!error})}
        placeholder={isLoading ? '' : `Enter amount in ${symbol}`}
        error={error}
        value={isLoading ? '' : props.getValue()}
        onChange={props.handleInput}
      />
      {isLoading ? <Loader className='loader input' /> : null}
      <div className='input-coin-symbol'>{symbol}</div>
    </Fragment>
  )
}

AmountTextInput.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  symbol: PropTypes.string.isRequired,
  handleInput: PropTypes.func.isRequired,
  getValue: PropTypes.func.isRequired,
  error: PropTypes.string
}

class BuySellAmounts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      inputField: '',
      advancedInputField: 'priceChange',
      advanced: false,
      cln: props.cln || '',
      cc: props.cc || '',
      priceChange: props.priceChange || this.defaultPriceChange()
    }
  }

  defaultPriceChange = () => (this.props.isBuy === true ? DEFAULT_PRICE_CHANGE : DEFAULT_PRICE_CHANGE * (-1))

  next = () => {
    const { minimum, priceLimit, priceChange } = this.state
    const { isBuy, community, uiActions } = this.props

    uiActions.setBuySellAmounts({
      buyStage: 2,
      ccAddress: community.address,
      cln: this.cln(),
      cc: this.cc(),
      isBuy,
      minimum,
      priceLimit,
      priceChange
    })
  }

  askForClnQuote = (amount) => {
    const {isBuy, community, marketMakerActions} = this.props
    if (isBuy) {
      marketMakerActions.buyQuote(community.address, amount)
    } else {
      marketMakerActions.invertSellQuote(community.address, amount)
    }
  }

  askForCcQuote = (amount) => {
    const {isBuy, community, marketMakerActions} = this.props
    if (isBuy) {
      marketMakerActions.invertBuyQuote(community.address, amount)
    } else {
      marketMakerActions.sellQuote(community.address, amount)
    }
  }

  handleClnInput = (event) => {
    const { clnBalance } = this.props

    const cln = new BigNumber(event.target.value).multipliedBy(1e18)

    if (cln.decimalPlaces() > 0) {
      this.setState({
        maxAmountError: 'Precision too hight'
      })
      return
    }

    this.setState({
      cln: event.target.value,
      cc: '',
      inputField: 'cln',
      maxAmountError: cln.isGreaterThan(clnBalance) ? 'Insufficient Funds' : undefined
    })
    this.askForClnQuote(cln)
  }

  handleCcInput = (event) => {
    const cc = new BigNumber(event.target.value).multipliedBy(1e18)

    if (cc.decimalPlaces() > 0) {
      this.setState({
        maxAmountError: 'Precision too hight'
      })
      return
    }

    this.setState({
      cc: event.target.value,
      inputField: 'cc'
    })

    this.askForCcQuote(cc)
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
    return this.state.inputField !== 'cc' ? this.state.cln : (
      this.props.isBuy ? new BigNumber(this.props.quotePair.inAmount || 0).div(1e18).toFixed(ROUND_PRECISION, BigNumber.ROUND_UP)
        : new BigNumber(this.props.quotePair.outAmount || 0).div(1e18).toFixed(ROUND_PRECISION, BigNumber.ROUND_DOWN)
    )
  }

  cc = () => {
    return this.state.inputField !== 'cln' ? this.state.cc : (
      this.props.isBuy ? new BigNumber(this.props.quotePair.outAmount || 0).div(1e18).toFixed(ROUND_PRECISION, BigNumber.ROUND_UP)
        : new BigNumber(this.props.quotePair.inAmount || 0).div(1e18).toFixed(ROUND_PRECISION, BigNumber.ROUND_DOWN)
    )
  }

  slippage = () => new BigNumber(this.props.quotePair.slippage || 0).multipliedBy(100).toFixed(ROUND_PRECISION, BigNumber.ROUND_UP)

  priceLimit = () => this.state.advancedInputField === 'priceLimit' ? this.state.priceLimit
    : (1 + this.priceChange() / 100) * this.price()

  minimum = () => this.state.advancedInputField === 'minimum'
    ? this.state.minimum
    : this.getRelevantAmount() / (1 + this.priceChange() / 100)

  priceChange = () => this.state.advancedInputField === 'priceChange'
    ? this.state.priceChange
    : this.getRelevantAmount() / this.minimum()

  getRelevantAmount = () => this.props.isBuy ? this.cc() : this.cln()
  // maxAmountError = () => this.props.isBuy ?
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
    this.props.uiActions.setModalProps({
      isBuy: !this.props.isBuy
    })

    this.setState({
      cc: '',
      cln: '',
      inputField: ''
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
      const clnBalance = new BigNumber(this.props.clnBalance).div(1e18).toFormat(ROUND_PRECISION, 1)
      return <div className={maxAmountClass} onClick={this.handleClnClickMax}>{`Max: ${clnBalance} CLN`}</div>
    } else {
      const ccBalance = new BigNumber(this.props.ccBalance).div(1e18).toFormat(ROUND_PRECISION, 1)
      const ccSymbol = this.props.community.symbol
      return <div className={maxAmountClass} onClick={this.handleCcClickMax}>{`Max: ${ccBalance} ${ccSymbol}`}</div>
    }
  }

  render () {
    const { isBuy, community, isFetching } = this.props
    const { advanced, maxAmountError, inputField } = this.state
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
            isBuy ? <AmountTextInput
              isLoading={isFetching && inputField !== 'cln'}
              symbol='CLN'
              getValue={this.cln}
              handleInput={this.handleClnInput}
              error={maxAmountError} />
              : <AmountTextInput
                isLoading={isFetching && inputField !== 'cc'}
                symbol={community.symbol}
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
            <div className='cc-to-cln'>{`1 ${ccSymbol} = ${this.price().toFixed(ROUND_PRECISION, BigNumber.ROUND_UP)} CLN`}</div>
            {this.slippage() ? <div>PRICE SLIPPAGE<img src={Info} />{`${this.slippage()}%`}</div> : null}
          </div>
          {
            !isBuy ? <AmountTextInput
              isLoading={isFetching && inputField !== 'cln'}
              symbol='CLN'
              getValue={this.cln}
              handleInput={this.handleClnInput} />
              : <AmountTextInput
                isLoading={isFetching && inputField !== 'cc'}
                symbol={community.symbol}
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

BuySellAmounts.defaultProps = {
  isFetching: false
}

const mapStateToProps = (state, props) => ({
  quotePair: state.marketMaker.quotePair || {},
  isFetching: state.marketMaker.quotePair && state.marketMaker.quotePair.isFetching,
  ...props
})

export default connect(mapStateToProps)(BuySellAmounts)
