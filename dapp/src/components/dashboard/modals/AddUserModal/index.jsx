import React from 'react'
import Modal from 'components/common/Modal'
import AddUserForm from '../../components/AddUserForm'

export default ({ hideModal, submitEntity }) => {
  const handleSubmitUser = (...args) => {
    submitEntity(...args)
    hideModal()
  }

  return (
    <Modal className='user-form__modal' onClose={hideModal}>
      <div className='user-form__wrapper'>
        <div className='user-form__image'>
          <div />
        </div>
        <AddUserForm submitEntity={handleSubmitUser} />
      </div>
    </Modal>
  )
}
