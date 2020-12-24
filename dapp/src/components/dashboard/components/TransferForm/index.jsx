import React from 'react'
import { Formik, ErrorMessage, Form } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/SignMessage'
import transferShape from 'utils/validation/shapes/transfer'
import TextField from '@material-ui/core/TextField'

export default ({
  balance,
  sendTo,
  transactionStatus,
  transferMessage,
  closeMessage,
  error,
  handleTransfer
}) => {
  const onSubmit = (values, formikBag) => {
    const { to, amount } = values
    handleTransfer({ to, amount })
    formikBag.resetForm()
  }

  const transactionError = () => {
    return transactionStatus && transactionStatus === 'FAILURE' && transferMessage
  }

  const transactionDenied = () => {
    return transactionError() && transferMessage && error && typeof error.includes === 'function' && error.includes('denied')
  }

  const transactionConfirmed = () => {
    return transactionStatus && (transactionStatus === 'SUCCESS' || transactionStatus === 'CONFIRMATION') && transferMessage
  }

  const renderForm = ({ isValid, setFieldTouched, values, handleChange, errors, touched, resetForm }) => {
    return (
      <Form className='transfer__content grid-y align-justify'>

        <Message
          message={'Your money has been sent successfully'}
          isOpen={transactionConfirmed()}
          clickHandler={() => {
            resetForm()
            closeMessage()
          }}
          subTitle=''
        />
        <Message
          message={'Oops, something went wrong'}
          subTitle=''
          isOpen={transactionError()}
          clickHandler={closeMessage}
        />

        <Message
          message={'Oh no'}
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={transactionDenied()}
          clickHandler={closeMessage}
        />

        <div className='grid-y field'>
          <h3 className='field__title'>Who do you want to send?</h3>

          <TextField
            onBlur={() => setFieldTouched('to', true)}
            name='to'
            fullWidth
            value={values.to}
            type='search'
            autoComplete='off'
            margin='none'
            error={errors && errors.to && touched.to && true}
            onChange={handleChange}
            InputProps={{
              classes: {
                underline: 'user-form__field__underline',
                error: 'user-form__field__error'
              }
            }}
            InputLabelProps={{
              shrink: true,
              className: 'user-form__field__label'
            }}
          />
          <ErrorMessage name='to' render={msg => <div className='input-error'>{msg}</div>} />
        </div>
        <div className='grid-y field'>
          <h3 className='field__title'>Insert amount</h3>

          <TextField
            onBlur={() => setFieldTouched('amount', true)}
            name='amount'
            fullWidth
            placeholder='0'
            value={values.amount}
            type='number'
            autoComplete='off'
            margin='none'
            error={errors && errors.amount && touched.amount && true}
            onChange={handleChange}
            InputProps={{
              classes: {
                underline: 'user-form__field__underline',
                error: 'user-form__field__error'
              }
            }}
            InputLabelProps={{
              shrink: true,
              className: 'user-form__field__label'
            }}
          />
          <ErrorMessage name='amount' render={msg => <div className='input-error'>{msg}</div>} />
        </div>

        <div className='transfer__content__button'>
          <TransactionButton type='submit' disabled={!isValid} />
        </div>
      </Form>
    )
  }

  return (
    <Formik
      initialValues={{
        to: sendTo || '',
        amount: ''
      }}
      validationSchema={transferShape(balance && typeof balance.replace === 'function' ? balance.replace(/,/g, '') : 0)}
      onSubmit={onSubmit}
      validateOnMount
      enableReinitialize
    >
      {(props) => renderForm(props)}
    </Formik>
  )
}
