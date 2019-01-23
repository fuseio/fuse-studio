import React from 'react'

import Modal from 'components/Modal'
import Mail from 'images/mail.png'

class ComingSoonModal extends React.Component {
  onClose = () => {
    this.props.hideModal()
  }

  render () {
    return (
      <Modal onClose={this.onClose}>
        <img src={Mail} />
        <h4>HODL your horses</h4>
        <p>You'll soon be able to buy and sell community coins with your CLN tokens. This isn't ready yet - so hang tight.</p>
      </Modal>
    )
  }
}

export default ComingSoonModal
