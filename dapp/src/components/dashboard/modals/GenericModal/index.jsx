import React from 'react'
import Modal from 'components/common/Modal'
import GenericHeader from 'images/generic-header.png'

const GenericModal = ({ hideModal, content, buttonAction, image, hasCloseBtn = true }) =>
  <Modal className='generic-modal' onClose={hideModal} hasCloseBtn={hasCloseBtn}>
    <div className='generic-modal__image'>
      <img src={content.image || GenericHeader} />
    </div>
    <div className='generic-modal__container'>
      <div className='generic-modal__title'>
        {content.title}
      </div>
      <div className='generic-modal__text'>
        {content.body}
      </div>
      {content.buttonText && <button className='generic-modal__button' onClick={buttonAction}>{content.buttonText}</button>}
    </div>
  </Modal>

export default GenericModal
