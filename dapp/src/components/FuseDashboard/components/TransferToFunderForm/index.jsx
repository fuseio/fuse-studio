import React from 'react'
import TextField from '@material-ui/core/TextField'
import { Form, Formik } from 'formik'
import { object, number } from 'yup'
import TransactionButton from 'components/common/TransactionButton'
import withTransaction from 'components/common/WithTransaction'

const Scheme = object().noUnknown(false).shape({
  amount: number().positive()
})

const TransferToFunderForm = ({
  handleSendTransaction,
  transactionStatus,
  transactionHash,
  receipt,
  isRequested,
  isDenied,
  isPending,
  isConfirmed,
  isFailed,
  clearTransaction,
  makeTransaction,
  balance,
  symbol,
  funderBalance
}) => {
  const onSubmit = (values, formikBag) => {
    const { amount } = values
    handleSendTransaction(() => makeTransaction(amount))
    // formikBag.resetForm()
  }

  const renderHasBalanceForm = ({ isValid, values, handleChange }) => {
    const { amount } = values
    return (
      <Form className='join_bonus__container'>
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
      </Form>
    )
  }

  const renderForm = ({ isValid, values, handleChange }) => {
    const { amount } = values
    return (
      <Form className='join_bonus__container'>
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
        <p className='join_bonus__title'>In order to reward users with bonuses you must first fill your funder balance. Bonuses are sent directly from the funder balancer. If the funder balance is empty users will no longer receive bonuses.</p>
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
      </Form>
    )
  }

  return (
    <Formik
      initialValues={{
        amount: ''
      }}
      validationSchema={Scheme}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange
    >
      {(props) => Number(funderBalance) <= 0 ? renderForm(props) : renderHasBalanceForm(props)}
    </Formik>
  )
}

export default withTransaction(TransferToFunderForm)
