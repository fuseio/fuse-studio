import React, { PureComponent } from 'react'
import { Formik, Field, ErrorMessage } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/Message'
import transferShape from 'utils/validation/shapes/transfer'

export default class TransferForm extends PureComponent {
  constructor (props) {
    super(props)

    const { balance } = this.props

    this.initialValues = {
      to: '',
      amount: ''
    }

    this.validationSchema = transferShape(balance && typeof balance.replace === 'function' ? balance.replace(/,/g, '') : 0)
  }

  onSubmit = async (values) => {
    const { handleTransper } = this.props
    const { to, amount } = values
    await handleTransper({ to, amount })
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

  renderForm = ({ handleSubmit, isValid }) => {
    const {
      closeMessage
    } = this.props

    return (
      <form className='transfer-tab__content' onSubmit={handleSubmit}>

        <Message
          message={'Your money has been sent successfully'}
          isOpen={this.transactionConfirmed()}
          clickHandler={closeMessage}
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

        <div className='transfer-tab__content__to-field'>
          <span className='transfer-tab__content__to-field__text'>To</span>
          <Field
            name='to'
            className='transfer-tab__content__to-field__input'
          />
          <ErrorMessage name='to' render={msg => <div className='input-error'>{msg}</div>} />
        </div>
        <div className='transfer-tab__content__amount'>
          <span className='transfer-tab__content__amount__text'>Amount</span>
          <Field
            name='amount'
            type='number'
            className='transfer-tab__content__amount__field'
          />
          <ErrorMessage name='amount' render={msg => <div className='input-error'>{msg}</div>} />
        </div>

        <div className='transfer-tab__content__button'>
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
      />
    )
  }
}
