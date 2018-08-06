import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import trim from 'lodash/trim'
import identity from 'lodash/identity'
import web3Utils from 'web3-utils'

import TextInput from 'components/TextInput'
import Loader from 'components/Loader'
import { BigNumber } from 'bignumber.js'
import DownArrow from 'images/down-arrow.png'
import Arrows from 'images/arrows.png'
import Info from 'images/info.png'
import * as utils from './utils.js'

const DEFAULT_PRICE_CHANGE = 0.02

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
  error: PropTypes.string
}

const calculatePriceLimit = (pricePercentage, price) => (1 + pricePercentage) * price
const calculateMinimum = (pricePercentage, relevantAmount) => relevantAmount / (1 + pricePercentage)

class AdvancedSettings extends Component {
  handlePricePercentage = (event) => {
    const pricePercentage = event.target.value / 100
    const minimum = calculateMinimum(pricePercentage, this.props.relevantAmount)
    const priceLimit = calculatePriceLimit(pricePercentage, this.props.price())

    this.props.setAdvanced({
      minimum,
      pricePercentage,
      priceLimit
    })
  }

  handlePriceLimit = (event) => {
    const priceLimit = event.target.value
    const pricePercentage = priceLimit / this.props.price() - 1

    const minimum = calculateMinimum(pricePercentage, this.props.relevantAmount)

    this.props.setAdvanced({
      minimum,
      pricePercentage,
      priceLimit
    })
  }

  handleMinimum = (event) => {
    const minimum = event.target.value
    const pricePercentage = 100 * (this.props.relevantAmount / minimum - 1)
    const priceLimit = calculatePriceLimit(minimum, this.props.price())

    this.props.setAdvanced({
      minimum,
      pricePercentage,
      priceLimit
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.relevantAmount.isEqualTo(nextProps.relevantAmount)) {
      const minimum = calculateMinimum(this.props.pricePercentage, nextProps.relevantAmount)
      const priceLimit = calculatePriceLimit(this.props.pricePercentage, this.props.price())

      this.props.setAdvanced({
        minimum,
        priceLimit
      })
    }
  }

  render = () => {
    const {isBuy} = this.props
    const {symbol} = this.props.community

    const advancedClass = classNames({
      'advanced-settings': true,
      'open': this.props.isOpen
    })

    return (
      <div className={advancedClass}>
        <div className='advanced-header'>
          <h5 onClick={this.props.handleToggle}>Advanced settings</h5>
          <img onClick={this.props.handleToggle} src={DownArrow} />
        </div>
        <TextInput id='minimum'
          type='number'
          label='MINIMAL ACCEPTABLE AMOUNT'
          placeholder={`Enter minimal amount of ${isBuy ? symbol : 'cln'}`}
          onChange={this.handleMinimum}
          value={this.props.minimum}
        />
        <div className='minimum-coin-symbol'>{isBuy ? symbol : 'CLN'}</div>
        <TextInput id='price-change'
          type='number'
          label={`${symbol} PRICE CHANGE`}
          placeholder='Enter price change in %'
          value={this.props.pricePercentage * 100}
          onChange={this.handlePricePercentage}
        />
        <div className='price-change-percent'>%</div>
        <TextInput id='price-limit'
          type='number'
          label={`${symbol} PRICE LIMIT`}
          placeholder={`Enter price limit for ${symbol}`}
          value={this.props.priceLimit}
          onChange={this.handlePriceLimit}
        />

        <div className='price-limit-cln'>CLN</div>
        <p className='annotation'>{`The transaction will fail if the price of 1 ${symbol} is ${(isBuy ? 'higher' : 'lower')} than ${(this.props.priceLimit)} CLN`}</p>
      </div>
    )
  }
}

AdvancedSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isBuy: PropTypes.bool.isRequired,
  community: PropTypes.object.isRequired,
  handleToggle: PropTypes.func.isRequired,
  minimum: PropTypes.string.isRequired,
  relevantAmount: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  price: PropTypes.func.isRequired
}

class BuySellAmounts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      inputField: props.inputField || '',
      advanced: false,
      cln: props.cln || '',
      cc: props.cc || '',
      minimum: props.minimum || '',
      priceLimit: props.priceLimit || '',
      pricePercentage: props.pricePercentage || this.defaultPricePercentage()
    }
  }

  defaultPricePercentage = () => (this.props.isBuy === true ? DEFAULT_PRICE_CHANGE : DEFAULT_PRICE_CHANGE * (-1))

  next = () => {
    const { minimum, priceLimit, pricePercentage, inputField } = this.state
    const { isBuy, uiActions } = this.props

    uiActions.setModalProps({
      buyStage: 2,
      cln: this.cln(),
      cc: this.cc(),
      inputField,
      isBuy,
      minimum,
      priceLimit,
      pricePercentage
    })
  }

  askForClnQuote = (amount) => {
    const {isBuy, community, marketMakerActions} = this.props
    const amountInWei = web3Utils.toWei(amount.toString())
    if (isBuy) {
      marketMakerActions.buyQuote(community.address, amountInWei)
    } else {
      marketMakerActions.invertSellQuote(community.address, amountInWei)
    }
  }

  askForCcQuote = (amount) => {
    const amountInWei = web3Utils.toWei(amount.toString())
    const {isBuy, community, marketMakerActions} = this.props
    if (isBuy) {
      marketMakerActions.invertBuyQuote(community.address, amountInWei)
    } else {
      marketMakerActions.sellQuote(community.address, amountInWei)
    }
  }

  validateInput = (amount, balance) => {
    if (trim(amount) === '') {
      return ''
    }
    const amountInWei = new BigNumber(web3Utils.toWei(amount.toString()))

    if (amountInWei.decimalPlaces() > 0) {
      return 'Precision too hight'
    }

    return amountInWei.isGreaterThan(balance) ? 'Insufficient Funds' : undefined
  }

  handleClnInput = (event) => {
    const amount = event.target.value

    this.setState({
      cln: amount,
      cc: '',
      inputField: 'cln',
      maxAmountError: this.validateInput(amount, this.props.clnBalance)
    })
    if (trim(amount)) {
      this.askForClnQuote(amount)
    }
  }

  handleCcInput = (event) => {
    const amount = event.target.value

    const cc = new BigNumber(web3Utils.toWei(amount))

    if (cc.decimalPlaces() > 0) {
      this.setState({
        maxAmountError: 'Precision too hight'
      })
      return
    }

    this.setState({
      cc: amount,
      inputField: 'cc'
    })

    if (trim(amount)) {
      this.askForCcQuote(amount)
    }
  }

  handleClickMax = (handle, balance) => {
    handle({
      target: {
        value: new BigNumber(web3Utils.fromWei(balance.toString()))
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

  cln = (formatter = identity) => this.state.inputField !== 'cc' ? this.state.cln : (
    this.props.isBuy ? formatter(web3Utils.fromWei(this.props.quotePair.inAmount.toString()), this.props.isBuy)
      : formatter(web3Utils.fromWei(this.props.quotePair.outAmount.toString()), this.props.isBuy)
  )

  cc = (formatter = identity) => this.state.inputField !== 'cln' ? this.state.cc : (
    this.props.isBuy ? formatter(web3Utils.fromWei(this.props.quotePair.outAmount.toString()), this.props.isBuy)
      : formatter(web3Utils.fromWei(this.props.quotePair.inAmount.toString()), this.props.isBuy)
  )

  slippage = () => utils.roundUp(new BigNumber(this.props.quotePair.slippage).multipliedBy(100))

  getRelevantAmount = () => {
    const value = this.props.isBuy ? this.cc() : this.cln()
    if (trim(value) === '') {
      return BigNumber(0)
    } else {
      return BigNumber(value)
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

  setMinimum = (minimum) => this.setState({minimum})

  setAdvanced = (props) =>
    this.setState(props)

  renderClickMax = () => {
    const maxAmountClass = classNames({
      'max-amount': true,
      'error': this.state.maxAmountError
    })

    if (this.props.isBuy) {
      const clnBalance = new BigNumber(web3Utils.fromWei(this.props.clnBalance)).toFormat(utils.ROUND_PRECISION, BigNumber.ROUND_DOWN)
      return <div className={maxAmountClass} onClick={this.handleClnClickMax}>{`Max: ${clnBalance} CLN`}</div>
    } else {
      const ccBalance = new BigNumber(web3Utils.fromWei(this.props.ccBalance)).toFormat(utils.ROUND_PRECISION, BigNumber.ROUND_DOWN)
      const ccSymbol = this.props.community.symbol
      return <div className={maxAmountClass} onClick={this.handleCcClickMax}>{`Max: ${ccBalance} ${ccSymbol}`}</div>
    }
  }

  render () {
    const { isBuy, community, isFetching } = this.props
    const { maxAmountError, inputField } = this.state
    const ccSymbol = community.symbol

    const buyTabClass = classNames({
      'buy-tab': true,
      'active': isBuy
    })
    const sellTabClass = classNames({
      'buy-tab': true,
      'active': !isBuy
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
              getValue={this.cln.bind(null, utils.clnFormatter)}
              handleInput={this.handleClnInput}
              error={maxAmountError} />
              : <AmountTextInput
                isLoading={isFetching && inputField !== 'cc'}
                symbol={community.symbol}
                getValue={this.cc.bind(null, utils.ccFormatter)}
                handleInput={this.handleCcInput}
                error={maxAmountError}
              />
          }
          {this.renderClickMax()}
        </div>
        <div className='arrows'><img src={Arrows} /></div>
        <div className='buy-sell-bottom'>
          <div className='info-price'>
            <div className='cc-to-cln'>{`1 ${ccSymbol} = ${utils.roundUp(this.price())} CLN`}</div>
            {this.slippage() ? <div>PRICE SLIPPAGE<img src={Info} />{`${this.slippage()}%`}</div> : null}
          </div>
          {
            !isBuy ? <AmountTextInput
              isLoading={isFetching && inputField !== 'cln'}
              symbol='CLN'
              getValue={this.cln.bind(null, utils.clnFormatter, isBuy)}
              handleInput={this.handleClnInput} />
              : <AmountTextInput
                isLoading={isFetching && inputField !== 'cc'}
                symbol={community.symbol}
                getValue={this.cc.bind(null, utils.ccFormatter, isBuy)}
                handleInput={this.handleCcInput}
              />
          }
          <AdvancedSettings
            isOpen={this.state.advanced}
            handleToggle={this.handleAdvanced}
            isBuy={this.props.isBuy}
            community={this.props.community}
            minimum={this.state.minimum}
            priceLimit={this.state.priceLimit}
            pricePercentage={this.state.pricePercentage}
            setAdvanced={this.setAdvanced}
            price={this.price}
            relevantAmount={this.getRelevantAmount()}
            isFetching={this.props.isFetching} />
          <button disabled={maxAmountError || isFetching || !this.cc() || !this.cln()} onClick={this.next}>{isBuy ? `Buy ${ccSymbol}` : `Sell ${ccSymbol}`}</button>
        </div>
      </div>
    )
  }
}

BuySellAmounts.defaultProps = {
  isFetching: false,
  quotePair: {
    slippage: 0,
    inAmount: 0,
    outAmount: 0
  }
}

const mapStateToProps = (state, props) => ({
  quotePair: state.marketMaker.quotePair,
  isFetching: state.marketMaker.isFetchingQuotePair,
  ...props
})

export default connect(mapStateToProps)(BuySellAmounts)
