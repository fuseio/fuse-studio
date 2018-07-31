import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import {getEtherscanUrl} from 'selectors/web3'
import {getAccount} from 'selectors/accounts'
import Vimage from 'images/three.svg'
import Loader from 'components/Loader'

class Pending extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { account, pendingTx } = nextProps
    if (account && account.transactions && account.transactions[pendingTx] && account.transactions[pendingTx].isPending !== this.props.account.transactions[pendingTx].isPending && !account.transactions[pendingTx].isPending) {
      this.props.uiActions.setBuyStage(5)
    }
  }
  done = () => {
    this.props.uiActions.hideModal()
  }

  render() {
    return (
      <div className="transaction-in-progress">
        <h4>TRANSACTION IN PROGRESS</h4>
        <div className="summary-prices-wrapper">
          <Loader color="#fff" className="metamask-icon"/>
          <p>Your transaction is pending blockchain confirmation, please check your wallet again in a few minutes.</p>
          <div className="line"/>
          <h5>TRANSACTION HASH:</h5>
          <a href={`${this.props.etherscanUrl}tx/${this.props.pendingTx}`} target="_blank" className="tx-link">{this.props.pendingTx}</a>
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

export default connect(mapStateToProps, mapDispatchToProps)(Pending)
