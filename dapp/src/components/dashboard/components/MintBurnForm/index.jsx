import React, { PureComponent, Fragment } from 'react'
import { Formik, ErrorMessage } from 'formik'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/Message'
import { FAILURE, SUCCESS, CONFIRMATION } from 'actions/constants'
import upperCase from 'lodash/upperCase'
import mintBurnShape from 'utils/validation/shapes/mintBurn'
import TextField from '@material-ui/core/TextField'

export default class MintBurnForm extends PureComponent {
  constructor (props) {
    super(props)

    const { balance, actionType } = this.props

    this.initialValues = {
      actionType,
      mintAmount: '',
      burnAmount: ''
    }

    this.validationSchema = mintBurnShape(balance && typeof balance.replace === 'function' ? balance.replace(/,/g, '') : 0)
  }

  onSubmit = (values) => {
    const { handleMintOrBurnClick } = this.props
    const {
      actionType,
      mintAmount,
      burnAmount
    } = values

    const amount = actionType === 'mint' ? mintAmount : burnAmount
    handleMintOrBurnClick(amount)
  }

  transactionConfirmed = (actionType) => {
    const { transactionStatus, mintMessage, burnMessage } = this.props
    const sharedCondition = transactionStatus && (transactionStatus === SUCCESS || transactionStatus === CONFIRMATION)
    if (actionType === 'mint') {
      return sharedCondition && mintMessage
    } else {
      return sharedCondition && burnMessage
    }
  }

  transactionError = (actionType) => {
    const { transactionStatus, mintMessage, burnMessage } = this.props
    const sharedCondition = transactionStatus && transactionStatus === FAILURE
    if (actionType === 'mint') {
      return sharedCondition && mintMessage
    } else {
      return sharedCondition && burnMessage
    }
  }

  transactionDenied = (actionType) => {
    const {
      error
    } = this.props
    return this.transactionError(actionType) && error && typeof error.includes === 'function' && error.includes('denied')
  }

  renderForm = ({ handleSubmit, setFieldTouched, errors, handleChange, touched, setFieldValue, values, isValid }) => {
    const {
      tokenNetworkType,
      token,
      lastAction,
      // accountAddress,
      closeMintMessage,
      closeBurnMessage
    } = this.props

    const {
      actionType
    } = values

    return (
      <form className='transfer__content grid-y align-justify' style={{ height: '140px' }} onSubmit={handleSubmit}>

        <Message
          message={`Your just ${lastAction && lastAction.actionType}ed ${lastAction && lastAction.mintBurnAmount} ${token.symbol} on ${tokenNetworkType} network`}
          isOpen={this.transactionConfirmed(actionType)}
          subTitle=''
          clickHandler={
            actionType === 'mint'
              ? closeMintMessage
              : closeBurnMessage
          }
        />

        <Message
          message={'Oops, something went wrong'}
          isOpen={this.transactionError(actionType)}
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
          isOpen={this.transactionDenied(actionType)}
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
                    onBlur={() => setFieldTouched('mintAmount', true)}
                    name='mintAmount'
                    fullWidth
                    placeholder='0'
                    value={values.amount}
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
                  />
                  <ErrorMessage name='mintAmount' render={msg => <div className='input-error'>{msg}</div>} />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className='grid-y field'>
                  <h3 className='field__title'>Insert amount</h3>

                  <TextField
                    onBlur={() => setFieldTouched('burnAmount', true)}
                    name='burnAmount'
                    fullWidth
                    placeholder='0'
                    value={values.burnAmount}
                    type='number'
                    autoComplete='off'
                    margin='none'
                    error={errors && errors.burnAmount && touched.burnAmount && true}
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

  render = () => (
    <Formik
      initialValues={this.initialValues}
      validationSchema={this.validationSchema}
      render={this.renderForm}
      onSubmit={this.onSubmit}
      isInitialValid={false}
    />
  )
}
