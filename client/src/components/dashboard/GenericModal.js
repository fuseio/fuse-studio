import React from 'react'
import Modal from 'components/Modal'
import GenericHeader from 'images/generic-header.png'

const GenericModal = (props) =>
  <Modal className='generic-modal' onClose={props.hideModal}>
    <div className='generic-modal-header'>
      <img src={GenericHeader} className='generic-modal-header-img' />
    </div>
    <div className='generic-modal-container'>
      <div className='generic-modal-title'>
        {props.title}
      </div>
      <div className='generic-modal-text'>
        {props.body}
      </div>
      {props.buttonText && <button className='dashboard-transfer-btn' onClick={props.buttonAction}>{props.buttonText}</button>}
    </div>
  </Modal>

export default GenericModal
