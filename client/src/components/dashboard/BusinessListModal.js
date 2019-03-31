import React from 'react'
import PropTypes from 'prop-types'
import GenericModal from 'components/dashboard/GenericModal'

class BusinessListModal extends React.Component {
  handleClose = () => {
    this.props.hideModal()
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  }
  render () {
    const {buttonAction, owner, accountAddress} = this.props
    const isOwner = owner === accountAddress;
    const content = {
      title: 'Business list is not deployed yet',
      body: isOwner ? 'So you have a community currency and you connected it to the Fuse chain. Now it is the time to create a community! The first step is to deploy a list of businesses that can recieve your community currency in exchange of goods and services. The business list is managed via a smart contract to provide transaparency and business logic for the payments. This list will allow community members to know to what businesses they can use their tokens within the community wallet!' : 'The first step to become a community is to have a list of businesses that can recieve this community currency in exchange of goods and services. The business list is managed via a smart contract to provide transaparency and business logic for the payments. This list will allow community members to know to what businesses they can use their tokens within the community wallet!',
      buttonText: isOwner ? 'Deploy a Business list to Fuse network' : 'Got it'
    }
    return (
      <GenericModal
        hideModal={this.handleClose}
        content={content}
        buttonAction={buttonAction}
      />
    )
  }
}

BusinessListModal.propTypes = {
  supportedNetworks: PropTypes.array,
  handleClose: PropTypes.func
}

export default BusinessListModal
