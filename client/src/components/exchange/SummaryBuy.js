import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import { formatAmountReal, formatMoney } from 'services/global'
import { change, buyCc, sellCc } from 'actions/marketMaker'
import {BigNumber} from 'bignumber.js'
import {getAddresses} from 'selectors/web3'

import RightArrow from 'images/right-arrow.png'
import Info from 'images/info.png'
import BackButton from 'images/down-arrow.png'

class SummaryBuy extends React.Component {
  next = () => {
    this.props.uiActions.setBuyStage(3)
    if (this.props.isBuy) {
      this.props.buyCc(this.props.ccAddress, new BigNumber(this.props.cln).multipliedBy(1e18), this.props.minimum)
    } else {
      this.props.sellCc(this.props.ccAddress, new BigNumber(this.props.cc).multipliedBy(1e18), this.props.minimum)
    }
  }

  back = () => {
    this.props.uiActions.setBuyStage(1)
  }

  render () {
    const { community, isBuy, cln, cc } = this.props
    const ccSymbol = community && community.symbol
    const formattedPrice = this.props.quotePair.price
    const fromCoin = isBuy ? cln : cc
    const toCoin = isBuy ? cc : cln
    const fromSymbol = isBuy ? 'CLN' : ccSymbol
    const toSymbol = isBuy ? ccSymbol : 'CLN'

    return (
      <div className="summary">
        <div className="modal-back" onClick={this.back}>
          <img src={BackButton}/>
        </div>
        <h4>SUMMARY</h4>
        <div className="summary-prices-wrapper">
          <div className="summary-price">
            <h5>FROM COIN</h5>
            <div className="price">{fromCoin}<span>{fromSymbol}</span></div>
          </div>
          <div className="right-arrow">
            <img src={RightArrow} />
          </div>
          <div className="summary-price">
            <h5>TO COIN</h5>
            <div className="price">{toCoin}<span>{toSymbol}</span></div>
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
  uiActions: bindActionCreators(uiActions, dispatch),
  change: bindActionCreators(change, dispatch),
  buyCc: bindActionCreators(buyCc, dispatch),
  sellCc: bindActionCreators(sellCc, dispatch)
})

const mapStateToProps = (state, props) => ({
  community: state.tokens['0x24a85B72700cEc4cF1912ADCEBdB9E8f60BdAb91'],
  quotePair: state.marketMaker.quotePair || {},
  buyStage: state.ui.buyStage,
  isBuy: state.ui.isBuy,
  cln: state.ui.cln,
  cc: state.ui.cc,
  ccAddress: state.ui.ccAddress,
  minimum: state.ui.minimum
})

export default connect(mapStateToProps, mapDispatchToProps)(SummaryBuy)
