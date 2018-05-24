import React from 'react'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'
import Modal from 'components/Modal'

class LoginModal extends React.Component {
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
         <div className="login">
           <h1>Login</h1>
             
         </div>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
    return {
        uiActions: bindActionCreators(uiActions, dispatch),
    }
}
export default connect(null, mapDispatchToProps)(LoginModal)