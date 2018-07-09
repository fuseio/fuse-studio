import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import {getEtherscanUrl} from 'selectors/web3'
import Vimage from 'images/v.png'

class Pending extends React.Component {
  done = () => {
    this.props.uiActions.hideModal()
  }

  render() {
    return (
      <div className="transaction-in-progress">
        <h4>TRANSACTION IN PROGRESS</h4>
        <div className="summary-prices-wrapper">
          <img className="metamask-icon" src={Vimage} />
          <p>Your transaction is pending blockchain confirmation, please check your wallet again in a few minutes.</p>
          <div className="line"/>
          <h5>TRANSACTION HASH:</h5>
          <a href={`${this.props.etherscanUrl}tx/${this.props.pending}`} className="tx-link">{this.props.pending}</a>
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
  pending: state.marketMaker.transactionHash,
  etherscanUrl: getEtherscanUrl(state),
})

export default connect(mapStateToProps, mapDispatchToProps)(Pending)