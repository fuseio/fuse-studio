import React from 'react'
import Modal from 'components/common/Modal'

const EntityAddedModal = ({ name, type, hideModal }) => {
  return (
    <Modal className='entity_added' onClose={hideModal} hasCloseBtn>
      <div className='entity_added__title'>
        Congratulations!
      </div>
      <div className='entity_added__body'>
        <span>You have added</span>
        <span>{name}</span>
        <span>to your {type} list!</span>
      </div>
    </Modal>
  )
}

export default EntityAddedModal
