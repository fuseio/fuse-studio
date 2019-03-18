import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'components/Modal'

const Networks = ({networks}) => networks.map(network => <strong key={network} className='capitalize'>{network} Network</strong>)
  .reduce((prev, curr) => [prev, ' or ', curr])

class WrongNetworkModal extends React.Component {
  handleClose = () => {
    this.props.hideModal()
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  }

  render () {
    return (
      <Modal onClose={this.handleClose}>
        <h4>{'Hi there, seems that you\'re on the wrong network.'}</h4>
        <p>Please open Metamask and switch to the <Networks networks={this.props.supportedNetworks} /> to view correct CLN and CC information</p>
      </Modal>
    )
  }
}

WrongNetworkModal.defaultProps = {
  supportedNetworks: CONFIG.web3.supportedNetworks
}

WrongNetworkModal.propTypes = {
  supportedNetworks: PropTypes.array,
  handleClose: PropTypes.func
}

export default WrongNetworkModal
