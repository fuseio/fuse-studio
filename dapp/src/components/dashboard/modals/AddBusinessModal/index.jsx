import React from 'react'
import Modal from 'components/common/Modal'
import BusinessForm from '../../components/BusinessForm'
import TransactionMessage from 'components/common/TransactionMessage'
import { connect } from 'react-redux'

const AddBusinessModal = ({ hideModal, isJoin, showTransactionMessage, signatureNeeded, submitEntity, entity, transactionData }) => {
  const handleSubmitEntity = (...args) => {
    submitEntity(...args)
  }

  if (showTransactionMessage === false) {
    hideModal()
  }

  return (
    <Modal hasCloseBtn className='user-form__modal' onClose={hideModal}>
      <TransactionMessage
        title={isJoin ? 'Joining the list' : 'Adding business to list'}
        message={signatureNeeded ? 'Waiting for signing' : 'Pending'}
        isOpen={showTransactionMessage}
        isDark
      />
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
