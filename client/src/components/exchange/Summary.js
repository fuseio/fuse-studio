import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {BigNumber} from 'bignumber.js'
import web3Utils from 'web3-utils'

import Loader from 'components/Loader'
import RightArrow from 'images/right-arrow.png'
import Info from 'images/info.png'
import BackButton from 'images/down-arrow.png'
import {clnFormatter, ccFormatter} from './utils'
import Metamask from 'images/metamask-clean.svg'

class Summary extends Component {
  state = {
    waitingForSign: false
  }

  sendTransaction = () => {
    if (this.props.isBuy) {
      this.props.marketMakerActions.buyCc(this.props.community.address, web3Utils.toWei(this.props.cln.toString()), this.minimumInWei(), {
        gasPrice: new BigNumber(this.props.gas.average).div(10).multipliedBy(1e9),
        gas: this.props.estimatedGas
      })
    } else {
      this.props.marketMakerActions.sellCc(this.props.community.address, web3Utils.toWei(this.props.cc.toString()), this.minimumInWei(), {
        gasPrice: new BigNumber(this.props.gas.average).div(10).multipliedBy(1e9),
        gas: this.props.estimatedGas
      })
    }
    this.setState({
      waitingForSign: true
    })
  }

  minimumInWei = () => this.props.minimum && web3Utils.toWei(this.props.minimum.toString())

  componentDidMount () {
    const { isBuy, community, marketMakerActions } = this.props
    const estimageGas = isBuy ? marketMakerActions.estimateGasBuyCc : marketMakerActions.estimateGasSellCc
    const inputValue = isBuy ? this.props.cln : this.props.cc
    estimageGas(community.address, web3Utils.toWei(inputValue.toString()), this.minimumInWei())
  }

  componentDidUpdate () {
    if (this.props.transactionHash) {
      this.props.next()
    }
  }

  componentWillUnmount () {
    this.props.uiActions.updateModalProps({
      estimatedGas: null
    })
  }

  getCoinVariables = () => this.props.isBuy ? {
    fromCoin: clnFormatter(this.props.cln, this.props.isBuy),
    toCoin: ccFormatter(this.props.cc, this.props.isBuy),
    fromSymbol: 'CLN',
    toSymbol: this.props.community.symbol
  } : {
    fromCoin: ccFormatter(this.props.cc, this.props.isBuy),
    toCoin: clnFormatter(this.props.cln, this.props.isBuy),
    fromSymbol: this.props.community.symbol,
    toSymbol: 'CLN'
  }

  render () {
    const { community, gas, estimatedGas } = this.props
    const formattedPrice = this.props.quotePair.price.toFixed(5)
    const {fromCoin, toCoin, fromSymbol, toSymbol} = this.getCoinVariables()

    const gasPrice = (gas && estimatedGas) && new BigNumber(estimatedGas).multipliedBy(gas.average).div(10).div(1e9)
    return (
      <div className='summary'>
        <div className='modal-back' onClick={this.props.back}>
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
          <div>{'1 ' + community.symbol + ' = ' + formattedPrice + ' CLN'}</div>
        </div>
        <div className='line' />
        <div className='info-price'>
          <div><h5>GAS FEE NOTICE:</h5></div>
          <div><img className='icon' src={Metamask} /></div>
        </div>
        <p>Decreasing gas fee below the present value may result in failed transaction</p>
        <button disabled={!gasPrice || this.state.waitingForSign} onClick={this.sendTransaction}>PROCEED</button>
      </div>
    )
  }
}

Summary.propTypes = {
  community: PropTypes.object.isRequired
}

const mapStateToProps = (state, props) => ({
  gas: state.network.gas,
  ...props
})

export default connect(mapStateToProps)(Summary)
