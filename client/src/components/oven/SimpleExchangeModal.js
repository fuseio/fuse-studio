import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {BigNumber} from 'bignumber.js'

import Modal from 'components/Modal'
import {formatWei} from 'utils/format'
import FontAwesome from 'react-fontawesome'
import CommunityLogo from 'components/elements/CommunityLogo'
import TextInput from 'components/elements/TextInput'
import {connect} from 'react-redux'
import {buyQuote, buyCc} from 'actions/marketMaker'
import {PENDING, SUCCESS} from 'actions/constants'
import Loader from 'components/Loader'

class SimpleExchangeModal extends Component {
  state = {
    clnAmount: 0
  }

  renderTransactionStatus = (transactionStatus) => {
    switch (transactionStatus) {
      case PENDING:
        return <Loader color='#3a3269' className='loader' />
      case SUCCESS:
        return (<button className='btn-exchange' disabled>
          SUCCESS
        </button>)
      default:
        return (<button className='btn-exchange' onClick={this.handleExchange} disabled={this.isExchangeDisabled()}>
          ADD CLN
        </button>)
    }
  }

  handleClnChange = (event) => {
    const clnAmount = event.target.value
    this.setState({clnAmount})
    const amountInWei = new BigNumber(clnAmount.toString()).multipliedBy(1e18)

    this.props.buyQuote(this.props.token.address, amountInWei)
  }

  getTokenAmount = () => {
    if (this.props.quotePair) {
      return formatWei(this.props.quotePair.outAmount)
    }
    return ''
  }

  handleExchange = () => {
    const amountInWei = new BigNumber(this.state.clnAmount.toString()).multipliedBy(1e18)
    this.props.buyCc(this.props.token.address, amountInWei)
  }

  isExchangeDisabled = () => !this.state.clnAmount || this.props.transactionHash

  getStatus = () => this.props.receipt ? 'SUCCESS'
    : (this.props.transactionHash ? 'PENDING' : 'ADD CLN')

  render () {
    return (
      <Modal className='exchange-modal' onClose={this.props.hideModal}>
        <div className='exchange-modal-up'>
          <div>
            <CommunityLogo token={this.props.token} />
          </div>
          <div className='token-info'>
            <div>
              <span className='label'>Total Supply</span>
              <span className='positive-number'>{formatWei(this.props.token.totalSupply, 0)}</span></div>
            <div>
              <span className='label'>CLN reserve</span>
              <span className='positive-number'>{formatWei(this.props.marketMaker.clnReserve, 0)}</span></div>
          </div>
        </div>
        <div className='exchange-modal-down'>
          <div className='exchange-modal-middle'>
            <div className='exchange-modal-amounts'>
              <TextInput id='cln'
                className='exchange-modal-cln'
                type='number'
                label='CLN'
                placeholder='CLN amount'
                onChange={this.handleClnChange}
              />
              <FontAwesome name='exchange-alt' className='exchange-modal-icon' />
              <TextInput id='token'
                className='exchange-modal-token'
                type='string'
                label={this.props.token.symbol}
                placeholder={`${this.props.token.symbol} amount`}
                value={this.state.clnAmount.length ? this.getTokenAmount() : ''}
                disabled
              />
            </div>
            {this.renderTransactionStatus(this.props.transactionStatus)}
          </div>
        </div>
      </Modal>
    )
  }
}

SimpleExchangeModal.propTypes = {
  token: PropTypes.object.isRequired,
  marketMaker: PropTypes.object.isRequired
}

const mapStateToProps = (state, {tokenAddress}) => ({
  token: state.tokens[tokenAddress],
  marketMaker: state.marketMaker[tokenAddress]
})

const mapDispatchToProps = {
  buyQuote,
  buyCc
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleExchangeModal)
