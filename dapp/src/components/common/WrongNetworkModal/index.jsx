import React from 'react'
import PropTypes from 'prop-types'
import GenericModal from 'components/dashboard/modals/GenericModal'
import wrongNetwork from 'images/wrong_network.svg'

const Networks = ({ networks }) => networks.map(network => <strong key={network} className='capitalize' style={{ color: '#4a687b' }}>{network} Network</strong>)
  .reduce((prev, curr) => [prev, ' or ', curr])

class WrongNetworkModal extends React.Component {
  handleClose = () => {
    this.props.hideModal()
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  }

  render () {
    const content = {
      image: wrongNetwork,
      title: 'Wrong network',
      text: 'Hi there, seems that you\'re on the wrong network.',
      body: <p>Please open Metamask and switch to the <Networks networks={this.props.supportedNetworks} /></p>,
      buttonText: 'Ok'
    }
    return (
      <GenericModal
        hasCloseBtn={false}
        hideModal={this.handleClose}
        content={content}
        buttonAction={this.handleClose}
      />
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
