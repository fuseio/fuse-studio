import React from 'react'
import { Formik, ErrorMessage } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/SignMessage'
import transferShape from 'utils/validation/shapes/transfer'
import TextField from '@material-ui/core/TextField'
import withTransaction from 'components/common/WithTransaction'

export default withTransaction(({
  balance,
  sendTo,
  error,
  handleSendTransaction,
  clearTransaction,
  isRequested,
  isDenied,
  isPending,
  isConfirmed,
  isFailed
}) => {
  const onSubmit = (values, formikBag) => {
    const { to, amount } = values
    handleSendTransaction({ to, amount })
    formikBag.resetForm()
  }

  const renderForm = ({ handleSubmit, isValid, setFieldTouched, values, handleChange, errors, touched, resetForm }) => {
    return (
      <form className='transfer__content grid-y align-justify' onSubmit={handleSubmit}>
        <Message
          message='Your money has been sent successfully'
          isOpen={isConfirmed}
          clickHandler={() => {
            resetForm()
            clearTransaction()
          }}
          subTitle=''
        />
        <Message
          message='Oops, something went wrong'
          subTitle=''
          isOpen={isFailed}
          clickHandler={clearTransaction}
        />

        <Message
          message='Oh no'
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={isDenied}
          clickHandler={clearTransaction}
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
      </form>
    )
  }

  return (
    <Formik
      initialValues={{
        to: sendTo || '',
        amount: ''
      }}
      validationSchema={transferShape(balance && typeof balance.replace === 'function' ? balance.replace(/,/g, '') : 0)}
      render={renderForm}
      onSubmit={onSubmit}
      validateOnMount
      enableReinitialize
    />
  )
})
