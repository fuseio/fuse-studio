import React from 'react'
import Modal from 'components/Modal'
import EntityForm from './EntityForm'

const AddEntityModal = (props) =>
  <Modal className='modal-popup' onClose={props.hideModal}>
    <EntityForm addEntity={props.handleAddEntity} />
  </Modal>

export default AddEntityModal
