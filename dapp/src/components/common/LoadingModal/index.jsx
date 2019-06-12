import React, { Component } from 'react'
import Loader from 'components/Loader'
import Modal from 'components/Modal'

class LoadingModal extends Component {
  render () {
    return (
      <Modal className='fullscreen' onClose={this.props.hideModal}>
        <div className='transaction-in-progress'>
          <h4>SYNCING</h4>
          <div className='summary-prices-wrapper'>
            <Loader color='#fff' className='metamask-icon' />
            <p>We are syncing the data for you</p>
            <p>so you can progress to the next step</p>
          </div>
        </div>
      </Modal>
    )
  }
}

export default LoadingModal
