import React from 'react'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Modal from 'components/Modal'
import Mail from 'images/mail.png'


class ComingSoonModal extends React.Component {
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
         <img src={Mail}/>
         <h4>Coming Soon</h4>
         <p>You will have the ability to buy and sell community tokens with your CLN tokens. Stay tuned.</p>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    }
}
export default connect(null, mapDispatchToProps)(ComingSoonModal)