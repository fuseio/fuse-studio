import React, { PureComponent } from 'react'
import { Formik, ErrorMessage } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/Message'
import transferShape from 'utils/validation/shapes/transfer'
import TextField from '@material-ui/core/TextField'

export default class TransferForm extends PureComponent {
  constructor (props) {
    super(props)

    const { balance, sendTo } = this.props

    this.initialValues = {
      to: sendTo || '',
      amount: ''
    }

    this.validationSchema = transferShape(balance && typeof balance.replace === 'function' ? balance.replace(/,/g, '') : 0)
  }

  onSubmit = (values) => {
    const { handleTransfer } = this.props
    const { to, amount } = values
    handleTransfer({ to, amount })
  }

  transactionError = () => {
    const { transactionStatus, transferMessage } = this.props
    return transactionStatus && transactionStatus === 'FAILURE' && transferMessage
  }

  transactionDenied = () => {
    const { error, transferMessage } = this.props
    return this.transactionError() && transferMessage && error && typeof error.includes === 'function' && error.includes('denied')
  }

  transactionConfirmed = () => {
    const { transactionStatus, transferMessage } = this.props
    return transactionStatus && (transactionStatus === 'SUCCESS' || transactionStatus === 'CONFIRMATION') && transferMessage
  }

  renderForm = ({ handleSubmit, isValid, setFieldTouched, values, handleChange, errors, touched, resetForm }) => {
    const {
      closeMessage
    } = this.props

    return (
      <form className='transfer__content grid-y align-justify' onSubmit={handleSubmit}>

        <Message
          message={'Your money has been sent successfully'}
          isOpen={this.transactionConfirmed()}
          clickHandler={() => {
            resetForm()
            closeMessage()
          }}
          subTitle=''
        />
        <Message
          message={'Oops, something went wrong'}
          subTitle=''
          isOpen={this.transactionError()}
          clickHandler={closeMessage}
        />

        <Message
          message={'Oh no'}
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={this.transactionDenied()}
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
      </form>
    )
  }

  render () {
    return (
      <Formik
        initialValues={this.initialValues}
        validationSchema={this.validationSchema}
        render={this.renderForm}
        onSubmit={this.onSubmit}
        isInitialValid={false}
        enableReinitialize
      />
    )
  }
}
