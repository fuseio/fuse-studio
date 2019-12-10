import React from 'react'
import Modal from 'components/common/Modal'
import AddUserForm from '../../components/AddUserForm'
import TransactionMessage from 'components/common/TransactionMessage'
import { connect } from 'react-redux'

const AddUserModal = ({ hideModal, isJoin, showTransactionMessage, signatureNeeded, submitEntity, entity }) => {
  const handleSubmitUser = (...args) => {
    submitEntity(...args)
  }

  if (showTransactionMessage === false) {
    hideModal()
  }

  return (
    <Modal className='user-form__modal' onClose={hideModal}>
      <TransactionMessage
        title={isJoin ? 'Joining the list' : 'Adding user to list'}
        message={signatureNeeded ? 'Please sign with your wallet' : 'Pending'}
        isOpen={showTransactionMessage}
        isDark
      />
      <div className='user-form__wrapper'>
        <AddUserForm isJoin={isJoin} submitEntity={handleSubmitUser} entity={entity} />
      </div>
    </Modal>
  )
}

const mapStateToProps = (state) => ({
  ...state.screens.communityEntities
})

export default connect(mapStateToProps, null)(AddUserModal)
