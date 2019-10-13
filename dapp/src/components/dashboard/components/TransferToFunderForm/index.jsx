import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import { Formik } from 'formik'
import { object, number } from 'yup'
import TransactionButton from 'components/common/TransactionButton'
import SignMessage from 'components/common/SignMessage'

class TransferToFunderForm extends Component {
  constructor (props) {
    super(props)

    this.initialValues = {
      amount: ''
    }

    this.validationSchema = object().noUnknown(false).shape({
      amount: number().positive()
    })
  }

  onSubmit = (values, formikBag) => {
    const { amount } = values
    const { transferToFunder } = this.props
    transferToFunder(amount)
    formikBag.resetForm()
  }

  renderHasBalanceForm = ({ handleSubmit, isValid, values, handleChange }) => {
    const {
      transactionConfirmed,
      transactionDenied,
      transactionError,
      closeInnerModal,
      funderBalance,
      balance,
      symbol,
      isTransfer,
      transferSignature
    } = this.props
    const { amount } = values
    return (
      <form onSubmit={handleSubmit} className='join_bonus__container'>
        <div className='join_bonus__balances'>
          <div className='join_bonus__funder_balance'>
            <span>My balance:&nbsp;</span>
            <div>
              <span>{balance}&nbsp;</span>
              <small>{symbol}</small>
            </div>
          </div>
          <div className='join_bonus__funder_balance'>
            <span>Funder balance:&nbsp;</span>
            <div>
              <span>{funderBalance}&nbsp;</span>
              <small>{symbol}</small>
            </div>
          </div>
        </div>
        <div className='join_bonus__field'>
          <div className='join_bonus__field__add'>Add funder balance:</div>
          <TextField
            type='number'
            name='amount'
            placeholder='Insert amount'
            classes={{
              root: 'join_bonus__field'
            }}
            inputProps={{
              autoComplete: 'off',
              value: amount
            }}
            InputProps={{
              classes: {
                underline: 'join_bonus__field--underline',
                error: 'join_bonus__field--error'
              }
            }}
            onChange={handleChange}
          />
        </div>
        <div className='join_bonus__button'>
          <TransactionButton frontText='Send' disabled={!isValid} type='submit' />
        </div>

        <SignMessage message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
        <SignMessage message={'Pending'} isOpen={transferSignature} isDark />

        <SignMessage
          message={'Your money has been sent successfully'}
          isOpen={transactionConfirmed()}
          clickHandler={closeInnerModal}
          subTitle=''
        />
        <SignMessage
          message={'Oops, something went wrong'}
          subTitle=''
          isOpen={transactionError()}
          clickHandler={closeInnerModal}
        />

        <SignMessage
          message={'Oh no'}
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={transactionDenied()}
          clickHandler={closeInnerModal}
        />
      </form>
    )
  }

  renderForm = ({ handleSubmit, isValid, values, handleChange }) => {
    const {
      transactionConfirmed,
      transactionDenied,
      transactionError,
      closeInnerModal,
      funderBalance,
      balance,
      symbol,
      isTransfer,
      transferSignature
    } = this.props
    const { amount } = values
    return (
      <form onSubmit={handleSubmit} className='join_bonus__container'>
        <div className='join_bonus__balances'>
          <div className='join_bonus__funder_balance'>
            <span>My balance:&nbsp;</span>
            <div>
              <span>{balance}&nbsp;</span>
              <small>{symbol}</small>
            </div>
          </div>
          <div className='join_bonus__funder_balance'>
            <span>Funder balance:&nbsp;</span>
            <div>
              <span>{funderBalance}&nbsp;</span>
              <small>{symbol}</small>
            </div>
          </div>
        </div>
        <p className='join_bonus__title'>In order to reward your first users please transfer your tokens to the funder, choose how much to send to the funder:</p>
        <div className='join_bonus__field'>
          <TextField
            type='number'
            name='amount'
            placeholder='Insert amount'
            classes={{
              root: 'join_bonus__field'
            }}
            inputProps={{
              autoComplete: 'off',
              value: amount
            }}
            InputProps={{
              classes: {
                underline: 'join_bonus__field--underline',
                error: 'join_bonus__field--error'
              }
            }}
            onChange={handleChange}
          />
        </div>
        <div className='join_bonus__button'>
          <TransactionButton frontText='Send' disabled={!isValid} type='submit' />
        </div>

        <SignMessage message={'Pending'} isOpen={isTransfer} isDark subTitle={`Your money on it's way`} />
        <SignMessage message={'Pending'} isOpen={transferSignature} isDark />

        <SignMessage
          message={'Your money has been sent successfully'}
          isOpen={transactionConfirmed()}
          clickHandler={closeInnerModal}
          subTitle=''
        />
        <SignMessage
          message={'Oops, something went wrong'}
          subTitle=''
          isOpen={transactionError()}
          clickHandler={closeInnerModal}
        />

        <SignMessage
          message={'Oh no'}
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={transactionDenied()}
          clickHandler={closeInnerModal}
        />
      </form>
    )
  }

  render () {
    const { funderBalance } = this.props

    return (
      <Formik
        initialValues={this.initialValues}
        validationSchema={this.validationSchema}
        render={Number(funderBalance) <= 0 ? this.renderForm : this.renderHasBalanceForm}
        onSubmit={this.onSubmit}
        enableReinitialize
        validateOnChange
      />
    )
  }
}

export default TransferToFunderForm
