import React from 'react'

import Modal from 'components/Modal'

class WrongNetworkModal extends React.Component {
  onClose = () => {
    this.props.hideModal()
  }

  render () {
    return (
      <Modal onClose={this.onClose}>
        <h4>{'Hi there, seems that you\'re on the wrong network.'}</h4>
        <p>Please open Metamask and switch to the <strong>Main Ethereum Network</strong> or <strong>Ropsten Test Network</strong> to view correct CLN and CC information</p>
      </Modal>
    )
  }
}

export default WrongNetworkModal
