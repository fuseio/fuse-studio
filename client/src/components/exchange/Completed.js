import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import {getEtherscanUrl} from 'selectors/network'
import {getAccount} from 'selectors/accounts'
import Vimage from 'images/v.png'

class Completed extends React.Component {
  done = () => {
    this.props.uiActions.hideModal()
  }

  render () {
    const { account, transactionHash } = this.props
    const status = (account.transactions[transactionHash] && !account.transactions[transactionHash].isFailed) ? 'SUCCESS' : 'FAILURE'
    const statusClass = classNames({
      status: true,
      failure: status === 'FAILURE'
    })
    return (
      <div className='transaction-in-progress'>
        <h4>TRANSACTION COMPLETED</h4>
        <div className='summary-prices-wrapper'>
          <img className='metamask-icon' src={Vimage} />
          <p>Your transaction is completed.</p>
          <div className='line' />
          <h5>STATUS:</h5>
          <p className={statusClass}>{status}</p>
          <h5>TRANSACTION HASH:</h5>
          <a href={`${this.props.etherscanUrl}tx/${transactionHash}`} target='_blank' className='tx-link'>{transactionHash}</a>
        </div>
        <button onClick={this.done}>DONE</button>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  etherscanUrl: getEtherscanUrl(state),
  account: getAccount(state)
})

export default connect(mapStateToProps)(Completed)
