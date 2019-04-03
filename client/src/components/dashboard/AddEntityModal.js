import React from 'react'
import Modal from 'components/Modal'
import DynamicImg from 'images/dynamicdash.png'
import EntityForm from './EntityForm'

const AddEntityModal = (props) => {
  const handleSubmitEntity = (...args) => {
    props.submitEntity(...args)
    props.hideModal()
  }

  return (<Modal className='entity-modal' onClose={props.hideModal}>
    <div className='entity-modal-media'>
      <h3 className='entity-modal-media-title'>
        Bring Your Business to Fuse
      </h3>
      <img className='entity-modal-media-img' src={DynamicImg} />
    </div>
    <div className='entity-modal-content'>
      <EntityForm submitEntity={handleSubmitEntity} entity={props.entity} />
    </div>
  </Modal>)
}

export default AddEntityModal
