import React from 'react'
import Modal from 'components/common/Modal'
import BusinessForm from 'components/dashboard/components/BusinessForm'
import { connect } from 'react-redux'

const AddBusinessModal = ({ hideModal, isJoin, submitEntity, entity, users }) => {
  const handleSubmitEntity = (...args) => {
    hideModal()
    submitEntity(...args)
  }

  return (
    <Modal hasCloseBtn className='user-form__modal' onClose={hideModal}>
      <div className='user-form__wrapper'>
        <BusinessForm isJoin={isJoin} submitEntity={handleSubmitEntity} entity={entity} users={users} />
      </div>
    </Modal>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.communityEntities
})

export default connect(mapStateToProps, null)(AddBusinessModal)
