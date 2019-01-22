import React from 'react'
import Modal from 'components/Modal'
import DynamicImg from 'images/dynamicdash.png'
import EntityForm from './EntityForm'

const AddEntityModal = (props) =>
  <Modal className='entity-modal' onClose={props.hideModal}>
    <div className='entity-modal-media'>
      <h3 className='entity-modal-media-title'>
        Bring Your Business to Fuse
      </h3>
      <img className='entity-modal-media-img' src={DynamicImg} />
    </div>
    <div className='entity-modal-content'>
      <EntityForm addEntity={props.handleAddEntity} />
    </div>
  </Modal>

export default AddEntityModal
