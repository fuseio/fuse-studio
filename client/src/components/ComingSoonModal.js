import React from 'react'
import { connect } from 'react-redux'
import * as uiActions from 'actions/ui'
import { bindActionCreators } from 'redux'

import Modal from 'components/Modal'
import Mail from 'images/mail.png'
import ReactGA from 'services/ga'

class ComingSoonModal extends React.Component {
  constructor(props) {
    super(props)
    this.onClose = this.onClose.bind(this)
    ReactGA.event({
      category: 'Coming Soon',
      action: 'View',
      label: 'Coming Soon message'
    })
  }

  onClose() {
    this.props.uiActions.hideModal()
    ReactGA.event({
      category: 'Coming Soon',
      action: 'Close',
      label: 'Coming Soon message'
    })
  }

  render() {
    return (
      <Modal onClose={this.onClose}>
         <img src={Mail}/>
         <h4>Hold your horses</h4>
         <p>You'll soon be able to buy and sell community coins with your CLN tokens. This isn't ready yet - so hang tight.</p>
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
