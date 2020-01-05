import React from 'react'
import Modal from 'components/common/Modal'
import BusinessForm from 'components/dashboard/components/BusinessForm'
import { connect } from 'react-redux'

const AddBusinessModal = ({ hideModal, isJoin, showTransactionMessage, submitEntity, entity }) => {
  const handleSubmitEntity = (...args) => {
    submitEntity(...args)
  }

  if (showTransactionMessage === false) {
    hideModal()
  }

  return (
    <Modal hasCloseBtn className='user-form__modal' onClose={hideModal}>
      <div className='user-form__wrapper'>
        <BusinessForm isJoin={isJoin} submitEntity={handleSubmitEntity} entity={entity} />
      </div>
    </Modal>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.communityEntities
})

export default connect(mapStateToProps, null)(AddBusinessModal)
