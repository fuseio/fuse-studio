import React from 'react'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Modal from 'components/Modal'
import Mail from 'images/mail.png'


class ErrorModal extends React.Component {
  constructor(props) {
    super(props)
    this.onClose = this.onClose.bind(this)
  }

  onClose() {
    this.props.uiActions.hideModal()
    
  }

  render() {
    return (
      <Modal onClose={this.onClose}>
        <h4>Hi there, seems that you're on the wrong network.</h4>
        <p>Please open Metamask and switch to the <strong>Main Ethereum Network</strong> to view correct CLN and CC information</p>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    }
}
export default connect(null, mapDispatchToProps)(ErrorModal)