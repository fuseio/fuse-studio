import React, {Component} from 'react'
import { connect } from 'react-redux'

import {getEtherscanUrl} from 'selectors/network'
import {getAccount} from 'selectors/accounts'
import Loader from 'components/Loader'

class Pending extends Component {
  componentDidUpdate () {
    if (this.isDone()) {
      this.props.next()
    }
  }

  isDone = () => {
    const { account, transactionHash } = this.props
    return account.transactions[transactionHash] && !account.transactions[transactionHash].isPending
  }

  done = () => {
    this.props.uiActions.hideModal()
  }

  render () {
    return (
      <div className='transaction-in-progress'>
        <h4>TRANSACTION IN PROGRESS</h4>
        <div className='summary-prices-wrapper'>
          <Loader color='#fff' className='metamask-icon' />
          <p>Your transaction is pending blockchain confirmation, please check your wallet again in a few minutes.</p>
          <div className='line' />
          <h5>TRANSACTION HASH:</h5>
          <a href={`${this.props.etherscanUrl}tx/${this.props.transactionHash}`} target='_blank' className='tx-link'>{this.props.transactionHash}</a>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  etherscanUrl: getEtherscanUrl(state),
  account: getAccount(state)
})

export default connect(mapStateToProps)(Pending)
