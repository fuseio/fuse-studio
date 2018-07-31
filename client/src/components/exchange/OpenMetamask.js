import React from 'react'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Metamask from 'images/metamask-dark.png'

class OpenMetamask extends React.Component {
  componentWillReceiveProps (nextProps) {
    if (this.props.pending !== nextProps.pending) {
      this.props.uiActions.setBuyStage(4)
    }
  }

  render () {
    return (
      <div className='metamask-sign'>
        <h4>METAMASK EXTENSION</h4>
        <div className='summary-prices-wrapper'>
          <img className='metamask-icon' src={Metamask} />
          <p>Sign the transaction in your MetaMask extension</p>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  uiActions: bindActionCreators(uiActions, dispatch)
})

const mapStateToProps = (state, props) => ({
  pending: state.marketMaker.transactionHash
})

export default connect(mapStateToProps, mapDispatchToProps)(OpenMetamask)
