import React from 'react'

import Modal from 'components/Modal'
import ReactGA from 'services/ga'

class WrongNetworkModal extends React.Component {
  onClose = () => {
    this.props.hideModal()
    ReactGA.event({
      category: 'Network',
      action: 'Close',
      label: 'Wrong network message'
    })
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
