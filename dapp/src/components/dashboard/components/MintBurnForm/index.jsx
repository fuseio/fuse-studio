import React, { Fragment, useMemo } from 'react'
import { Formik, ErrorMessage } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/SignMessage'
import { FAILURE, SUCCESS, CONFIRMATION } from 'actions/constants'
import upperCase from 'lodash/upperCase'
import mintBurnShape from 'utils/validation/shapes/mintBurn'
import TextField from '@material-ui/core/TextField'

export default ({
  tokenNetworkType,
  symbol,
  lastAction,
  closeMintMessage,
  closeBurnMessage,
  balance,
  actionType,
  error,
  handleSendTransaction,
  transactionStatus,
  mintMessage,
  burnMessage
}) => {
  const initialValues = useMemo(() => ({
    actionType,
    mintAmount: '',
    burnAmount: ''
  }), [])

  const onSubmit = (values, formikBag) => {
    const {
      actionType,
      mintAmount,
      burnAmount
    } = values

    const amount = actionType === 'mint' ? mintAmount : burnAmount
    handleSendTransaction(amount)
    formikBag.resetForm()
  }

  const transactionConfirmed = (actionType) => {
    const sharedCondition = transactionStatus && (transactionStatus === SUCCESS || transactionStatus === CONFIRMATION)
    if (actionType === 'mint') {
      return sharedCondition && mintMessage
    } else {
      return sharedCondition && burnMessage
    }
  }

  const transactionError = (actionType) => {
    const sharedCondition = transactionStatus && transactionStatus === FAILURE
    if (actionType === 'mint') {
      return sharedCondition && mintMessage
    } else {
      return sharedCondition && burnMessage
    }
  }

  const transactionDenied = (actionType) => {
    return transactionError(actionType) && error && typeof error.includes === 'function' && error.includes('denied')
  }

  const renderForm = ({ handleSubmit, errors, handleChange, touched, values, isValid }) => {
    const {
      actionType
    } = values

    return (
      <form className='transfer__content grid-y align-justify' style={{ height: '140px' }} onSubmit={handleSubmit}>

        <Message
          message={`Your just ${lastAction && lastAction.actionType}ed ${lastAction && lastAction.mintBurnAmount} ${symbol} on ${tokenNetworkType} network`}
          isOpen={transactionConfirmed(actionType)}
          subTitle=''
          clickHandler={
            actionType === 'mint'
              ? closeMintMessage
              : closeBurnMessage
          }
        />

        <Message
          message={'Oops, something went wrong'}
          isOpen={transactionError(actionType)}
          subTitle=''
          clickHandler={
            actionType === 'mint'
              ? closeMintMessage
              : closeBurnMessage
          }
        />

        <Message
          message={'Oh no'}
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={transactionDenied(actionType)}
          clickHandler={
            actionType === 'mint'
              ? closeMintMessage
              : closeBurnMessage
          }
        />

        {
          actionType === 'mint'
            ? (
              <Fragment>
                <div className='grid-y field'>
                  <h3 className='field__title'>Insert amount</h3>

                  <TextField
                    name='mintAmount'
                    fullWidth
                    placeholder='0'
                    type='number'
                    autoComplete='off'
                    margin='none'
                    error={errors && errors.mintAmount && touched.mintAmount && true}
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
                    inputProps={{
                      value: values.mintAmount
                    }}
                  />
                  <ErrorMessage name='mintAmount' render={msg => <div className='input-error'>{msg}</div>} />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className='grid-y field'>
                  <h3 className='field__title'>Insert amount</h3>

                  <TextField
                    name='burnAmount'
                    fullWidth
                    placeholder='0'
                    type='number'
                    autoComplete='off'
                    margin='none'
                    error={errors && errors.burnAmount && touched.burnAmount && true}
                    onChange={handleChange}
                    inputProps={{
                      value: values.burnAmount
                    }}
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
                  <ErrorMessage name='burnAmount' render={msg => <div className='input-error'>{msg}</div>} />
                </div>
              </Fragment>
            )
        }
        <div className='transfer__content__button'>
          {
            actionType && <TransactionButton type='submit' disabled={!isValid} frontText={upperCase(actionType)} />
          }
        </div>
      </form>
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={mintBurnShape(balance && typeof balance.replace === 'function' ? balance.replace(/,/g, '') : 0)}
      render={renderForm}
      onSubmit={onSubmit}
      isInitialValid={false}
      enableReinitialize
      validateOnChange
    />
  )
}
