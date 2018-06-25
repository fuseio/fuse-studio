import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { quote, invertQuote, change } from 'actions/marketMaker'
import { bindActionCreators } from 'redux'
import { formatAmountReal, formatMoney } from 'services/global'

import Modal from 'components/Modal'
import {BigNumber} from 'bignumber.js'

class InnerExchangeModal extends React.Component {
  state = {
    cln: '1e20',
    toCC: true,
    buyTab: true
  }

  onClose = () => this.props.uiActions.hideModal()

  // quoteCCtoCLN = () => {
  //   this.props.quote(this.props.ccAddress, new BigNumber('31038481756201995358'), this.props.clnAddress)
  // }
  //
  // quoteCLNtoCC = () => {
  //   this.props.quote(this.props.ccAddress, new BigNumber('1e20'), this.props.clnAddress)
  // }

  sell = () => {
    this.props.change(this.props.ccAddress, new BigNumber(this.state.cc), this.props.clnAddress, undefined, this.state.buyTab)
  }

  buy = () => {
    this.props.change(this.props.clnAddress, new BigNumber(this.state.cln), this.props.ccAddress, undefined, this.state.buyTab)
  }

  handleCLNInput = (event) => {
    this.setState({cln: event.target.value})
    this.setState({toCC: true})
    if (this.state.buyTab) {
      this.props.quote(this.props.clnAddress, new BigNumber(event.target.value), this.props.ccAddress, this.state.buyTab)
    } else {
      this.props.invertQuote(this.props.clnAddress, new BigNumber(event.target.value), this.props.ccAddress)
    }
  }

  handleCCInput = (event) => {
    this.setState({cc: event.target.value})
    this.setState({toCC: false})
    if (this.state.buyTab) {
      this.props.invertQuote(this.props.ccAddress, new BigNumber(event.target.value), this.props.clnAddress)
    } else {
      this.props.quote(this.props.ccAddress, new BigNumber(event.target.value), this.props.clnAddress, this.state.buyTab)
    }
  }

  componentDidMount () {
    if (this.state.toCC) {
      this.props.quote(this.props.clnAddress, new BigNumber(this.state.cln), this.props.ccAddress, this.state.buyTab)
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.quotePair !== this.props.quotePair) {
      if (this.state.toCC) {
        this.setState({cc: nextProps.quotePair.outAmount})
      } else {
        this.setState({cln: nextProps.quotePair.outAmount})
      }
    }
  }

  handleChangeTab = (type) => {
    this.setState({
      buyTab: type === 'buy'
    })
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
    const ccSymbol = this.props.community && this.props.community.symbol
    const formattedPrice = this.props.quotePair.price
    // const formattedPrice = ccPrice ? formatMoney(formatAmountReal(ccPrice, 18), 4, '.', ',') : 'loading'


    return (
      <Modal onClose={this.onClose}>
        <div className="buy-sell-top">
          <div className="buy-sell-tab">
            <div className={buyTabClass} onClick={this.handleChangeTab.bind(this, 'buy')}>BUY</div>
            <div className={sellTabClass} onClick={this.handleChangeTab.bind(this, 'sell')}>SELL</div>
          </div>
          <input className="buy-sell-input" type='text' placeholder="Enter amount in CLN" value={this.state.cln} onChange={this.handleCLNInput} />
        </div>
        <div className="buy-sell-bottom">
          <div className="cc-to-cln">{'1 ' + ccSymbol + " = " + formattedPrice + " CLN"}</div>
          <input className="buy-sell-input" type='text' placeholder={"Enter amount in " + ccSymbol} value={this.state.cc} onChange={this.handleCCInput} />

          <div><button onClick={this.state.buyTab ? this.buy : this.sell}>
            {this.state.buyTab ? 'Buy' : 'Sell'}
          </button></div>
        </div>

      </Modal>
    )
  }
}

InnerExchangeModal.propTypes = {
  ccAddress: PropTypes.string.isRequired,
  clnAddress: PropTypes.string.isRequired
}

InnerExchangeModal.defaultProps = {
  ccAddress: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91',
  clnAddress: '0x41C9d91E96b933b74ae21bCBb617369CBE022530'
}

const ExchangeModal = (props) => (
  props.community && props.community.isMarketMakerLoaded
    ? <InnerExchangeModal {...props} />
    : null
)

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  quote: bindActionCreators(quote, dispatch),
  invertQuote: bindActionCreators(invertQuote, dispatch),
  change: bindActionCreators(change, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: state.tokens['0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91'],
  quotePair: state.marketMaker.quotePair || {}
  // quotePair: getQuotePair(state, {toToken: '0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91', fromToken: '0x41C9d91E96b933b74ae21bCBb617369CBE022530'})
})

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeModal)
