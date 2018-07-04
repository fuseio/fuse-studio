import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import { formatAmountReal, formatMoney } from 'services/global'
import {BigNumber} from 'bignumber.js'
import {getAddresses} from 'selectors/web3'

import RightArrow from 'images/right-arrow.png'
import Info from 'images/info.png'

class SummaryBuy extends React.Component {
  next = () => {
    this.props.uiActions.setBuyStage(3)
  }

  componentWillMount () {

  }

  sell = () => {
    this.props.change(this.props.ccAddress, new BigNumber(this.state.cc), this.props.clnAddress, undefined, this.state.buyTab)
  }

  buy = () => {
    this.props.change(this.props.clnAddress, new BigNumber(this.state.cln), this.props.ccAddress, undefined, this.state.buyTab)
  }

  render() {
    const ccSymbol = this.props.community && this.props.community.symbol
    const formattedPrice = this.props.quotePair.price
    const inAmount = new BigNumber(this.props.quotePair.inAmount).div(1e18).toFixed(5)
    const outAmount = new BigNumber(this.props.quotePair.outAmount).div(1e18).toFixed(5)
    const fromCoin = this.props.addresses.ColuLocalNetwork === this.props.quotePair.fromToken ? inAmount : outAmount
    const toCoin = this.props.addresses.ColuLocalNetwork === this.props.quotePair.fromToken ? outAmount : inAmount
    const fromSymbol = this.props.addresses.ColuLocalNetwork === this.props.quotePair.fromToken ? 'CLN' : ccSymbol
    const toSymbol = this.props.addresses.ColuLocalNetwork === this.props.quotePair.fromToken ? ccSymbol : 'CLN'

    console.log("props.marketMaker.quotePair", this.props.quotePair, this.props.addresses.ColuLocalNetwork)
    return (
      <div className="summary">
        <h4>SUMMARY</h4>
        <div className="summary-prices-wrapper">
          <div className="summary-price">
            <h5>FROM COIN</h5>
            <div className="price">{fromCoin}{fromSymbol}</div>
          </div>
          <div className="right-arrow">
            <img src={RightArrow} />
          </div>
          <div className="summary-price">
            <h5>TO COIN</h5>
            <div className="price">{toCoin}{toSymbol}</div>
          </div>
        </div>
        <div className="info-price">
          <div>ESTIMATED TRANSACTION FEE
          <img src={Info} /></div>
          <div>0.0000018563 ETH</div>
        </div>
        <div className="info-price">
          <div>RATE</div>
          <div>{'1 ' + ccSymbol + " = " + formattedPrice + " CLN"}</div>
        </div>
        <div className="line"/>
        <h5>GAS PRICE NOTICE:</h5>
        <p>Increasing gas above the present value will result in failed transaction</p>
        <button onClick={this.next}>PROCEED</button>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  addresses: getAddresses(state),
  networkType: state.web3.networkType,
  community: state.tokens['0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91'],
  quotePair: state.marketMaker.quotePair || {},
  buyStage: state.ui.buyStage
})

export default connect(mapStateToProps, mapDispatchToProps)(SummaryBuy)