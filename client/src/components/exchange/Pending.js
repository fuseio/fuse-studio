import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Metamask from 'images/metamask-dark.png'

class Pending extends React.Component {
  done = () => {
    this.props.uiActions.hideModal()
  }

  render() {
    return (
      <div className="transaction-in-progress">
        <h4>TRANSACTION IN PROGRESS</h4>
        <div className="summary-prices-wrapper">
          <img className="metamask-icon" src={Metamask} />
          <p>Your transaction is pending blockchain confirmation, please check your wallet again in a few minutes.</p>
          <div className="line"/>
          <h5>TRANSACTION HASH:</h5>
          <a className="tx-link">d0998732</a>
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
  web3: state.web3
})

export default connect(mapStateToProps, mapDispatchToProps)(Pending)