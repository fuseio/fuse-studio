import React from 'react'
import capitalize from 'lodash/capitalize'
import PropTypes from 'prop-types'
import GenericModal from 'components/dashboard/modals/GenericModal'
import wrongNetwork from 'images/wrong_network.svg'

const Networks = ({ networks }) => networks.map(network => <strong key={network} className='capitalize' style={{ color: '#4a687b' }}>{capitalize(network)} Network</strong>)
  .reduce((prev, curr) => [prev, ' or ', curr])

class WrongNetworkModal extends React.Component {
  handleClose = () => {
    this.props.hideModal()
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  }

  render () {
    const { body } = this.props
    const content = {
      image: wrongNetwork,
      title: 'Wrong network',
      body: body || <p>Please open Metamask and switch to the <Networks networks={this.props.supportedNetworks} /></p>,
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
  supportedNetworks: CONFIG.web3.supportedNetworks,
  body: 'Hi there, seems that you\'re on the wrong network.'
}

WrongNetworkModal.propTypes = {
  supportedNetworks: PropTypes.array,
  handleClose: PropTypes.func
}

export default WrongNetworkModal
