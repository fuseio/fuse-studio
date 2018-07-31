import React from 'react'
import { connect } from 'react-redux'
import {BigNumber} from 'bignumber.js'

import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import { change, buyCc, sellCc } from 'actions/marketMaker'
import { getSelectedCommunity } from 'selectors/basicToken'
import Loader from 'components/Loader'

import RightArrow from 'images/right-arrow.png'
import Info from 'images/info.png'
import BackButton from 'images/down-arrow.png'

class SummaryBuy extends React.Component {
  next = () => {
    this.props.uiActions.setBuyStage(3)
    if (this.props.isBuy) {
      this.props.buyCc(this.props.ccAddress, new BigNumber(this.props.cln).multipliedBy(1e18), this.props.minimum && new BigNumber(this.props.minimum.toString()).multipliedBy(1e18), {
        gasPrice: new BigNumber(this.props.gas.average).div(10).multipliedBy(1e9),
        gas: this.props.estimatedGas
      })
    } else {
      this.props.sellCc(this.props.ccAddress, new BigNumber(this.props.cc).multipliedBy(1e18), this.props.minimum && new BigNumber(this.props.minimum.toString()).multipliedBy(1e18), {
        gasPrice: new BigNumber(this.props.gas.average).div(10).multipliedBy(1e9),
        gas: this.props.estimatedGas
      })
    }
  }

  back = () => {
    this.props.uiActions.setBuyStage(1)
  }

  render () {
    const { community, isBuy, cln, cc, gas, estimatedGas } = this.props
    const ccSymbol = community && community.symbol
    const formattedPrice = this.props.quotePair.price.toFixed(5)
    const fromCoin = isBuy ? cln : cc
    const toCoin = isBuy ? cc : cln
    const fromSymbol = isBuy ? 'CLN' : ccSymbol
    const toSymbol = isBuy ? ccSymbol : 'CLN'
    const gasPrice = (gas && estimatedGas) && new BigNumber(estimatedGas).multipliedBy(gas.average).div(10).div(1e9)
    return (
      <div className='summary'>
        <div className='modal-back' onClick={this.back}>
          <img src={BackButton} />
        </div>
        <h4>SUMMARY</h4>
        <div className='summary-prices-wrapper'>
          <div className='summary-price'>
            <h5>FROM COIN</h5>
            <div className='price'>{fromCoin}<span>{fromSymbol}</span></div>
          </div>
          <div className='right-arrow'>
            <img src={RightArrow} />
          </div>
          <div className='summary-price'>
            <h5>TO COIN</h5>
            <div className='price'>{toCoin}<span>{toSymbol}</span></div>
          </div>
        </div>
        <div className='info-price'>
          <div>ESTIMATED TRANSACTION FEE<img src={Info} /></div>
          <div>{gasPrice ? gasPrice + ' ETH' : <Loader className='loader' />}</div>
        </div>
        <div className='info-price'>
          <div>RATE</div>
          <div>{'1 ' + ccSymbol + ' = ' + formattedPrice + ' CLN'}</div>
        </div>
        <div className='line' />
        <h5>GAS PRICE NOTICE:</h5>
        <p>Increasing gas above the present value will result in failed transaction</p>
        <button disabled={!gasPrice} onClick={this.next}>PROCEED</button>
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
  community: getSelectedCommunity(state),
  quotePair: state.marketMaker.quotePair || {},
  estimatedGas: state.marketMaker.estimatedGas,
  gas: state.web3.gas,
  ...props
})

export default connect(mapStateToProps, mapDispatchToProps)(SummaryBuy)
