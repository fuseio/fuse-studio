import React from 'react'
import PropTypes from 'prop-types'
import GenericModal from 'components/dashboard/GenericModal'

class BridgeModal extends React.Component {
  handleClose = () => {
    this.props.hideModal()
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  }
  render () {
    const content = {
      title: 'Bridge is not deployed yet',
      body: 'In order to access cheaper and faster transactions on the Fuse chain, a bridge between the Ethereum network and the Fuse chain needs to be deployed. The bridge is a special smart contracts that locks the funds on one side of the bridge and unlock it on the other side. The bridge is opreated by validators who sign and lock the tokens  or unlocking it to provide easy movement between the chains.',
      buttonText: this.props.accountAddress === this.props.owner ? 'Deploy a Bridge to Fuse network' : 'Got it'
    }
    return (
      <GenericModal
        hideModal={this.handleClose}
        content={content}
        buttonAction={this.props.buttonAction}
      />
    )
  }
}

BridgeModal.propTypes = {
  supportedNetworks: PropTypes.array,
  handleClose: PropTypes.func
}

export default BridgeModal
