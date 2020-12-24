import React from 'react'
import omit from 'lodash/omit'
import get from 'lodash/get'
import { Formik, Field, ErrorMessage } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Modal from 'components/common/Modal'
import { string, object } from 'yup'

const Scheme = object().noUnknown(false).shape({
  account: string().normalize().required().isAddress()
})

const ImportExistingEntity = ({ entity, submitEntity }) => {
  const onSubmit = (values) => {
    const entity = omit(values, 'selectedType')

    submitEntity(entity)
  }

  const renderForm = ({ handleSubmit, isValid }) => {
    return (
      <form className='user-form' onSubmit={handleSubmit}>
        <h5 className='user-form__title'>Import existing entity</h5>
        <div className='user-form__field'>
          <label className='user-form__field__label'>Ethereum account</label>
          <Field
            name='account'
            className='user-form__field__input'
          />
          <ErrorMessage name='account' render={msg => <div className='input-error'>{msg}</div>} />
        </div>
        <div className='user-form__submit'>
          <TransactionButton type='submit' disabled={!isValid} />
        </div>
      </form>
    )
  }

  return (
    <Formik
      initialValues={{
        account: get(entity, 'account', '')
      }}
      validationSchema={Scheme}
      render={renderForm}
      onSubmit={onSubmit}
      validateOnMount
    />
  )
}

export default ({ hideModal, submitEntity, entity }) => {
  const handleSubmitUser = (...args) => {
    submitEntity(...args)
    hideModal()
  }

  return (
    <Modal className='user-form__modal' onClose={hideModal}>
      <ImportExistingEntity submitEntity={handleSubmitUser} />
    </Modal>
  )
}
