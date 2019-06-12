import React from 'react'
import Loader from 'components/common/Loader'
import Modal from 'components/common/Modal'

export default ({ hideModal }) => (
  <Modal className='fullscreen' onClose={hideModal}>
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
