import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import {getEtherscanUrl} from 'selectors/web3'
import {getAccount} from 'selectors/accounts'
import Vimage from 'images/v.png'

class Completed extends React.Component {
  componentWillReceiveProps(nextProps) {
    
  }

  done = () => {
    this.props.uiActions.hideModal()
  }

  render() {
    const { account, pendingTx } = this.props
    const status = (account && account.transactions && account.transactions[pendingTx] && !account.transactions[pendingTx].isFailed) ? 'SUCCESS' : 'FAILURE'
    const statusClass = classNames({
      status: true,
      failure: status === 'FAILURE'
    })
    return (
      <div className="transaction-in-progress">
        <h4>TRANSACTION COMPLETED</h4>
        <div className="summary-prices-wrapper">
          <img className="metamask-icon" src={Vimage} />
          <p>Your transaction is completed.</p>
          <div className="line"/>
          <h5>STATUS:</h5>
          <p className={statusClass}>{status}</p>
          <h5>TRANSACTION HASH:</h5>
          <a href={`${this.props.etherscanUrl}tx/${pendingTx}`} target="_blank" className="tx-link">{pendingTx}</a>
        </div>
        <button onClick={this.done}>DONE</button>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  pendingTx: state.marketMaker.transactionHash,
  etherscanUrl: getEtherscanUrl(state),
  account: getAccount(state)
})

export default connect(mapStateToProps, mapDispatchToProps)(Completed)