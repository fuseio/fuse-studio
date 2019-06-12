import React from 'react'
import Modal from 'components/Modal'
import DynamicImg from 'images/dynamicdash.png'
import BusinessForm from '../../components/BusinessForm'

const AddBusinessModal = (props) => {
  const handleSubmitEntity = (...args) => {
    props.submitEntity(...args)
    props.hideModal()
  }

  return (
    <Modal className='entity-modal' onClose={props.hideModal}>
      <div className='entity-modal-media'>
        <h3 className='entity-modal-media-title'>
          Bring Your Business to Fuse
        </h3>
        <img className='entity-modal-media-img' src={DynamicImg} />
      </div>
      <BusinessForm submitEntity={handleSubmitEntity} entity={props.entity} />
    </Modal>
  )
}

export default AddBusinessModal
