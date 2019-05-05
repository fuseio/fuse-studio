import React, { PureComponent, Fragment } from 'react'
import { Formik, Field, ErrorMessage } from 'formik'
import { object, mixed, number } from 'yup'
import TransactionButton from 'components/common/TransactionButton'
import Message from 'components/common/Message'
import {FAILURE, SUCCESS, CONFIRMATION} from 'actions/constants'
import { isOwner } from 'utils/token'
import upperCase from 'lodash/upperCase'
import classNames from 'classnames'

export default class MintBurnForm extends PureComponent {
  constructor (props) {
    super(props)

    const { balance } = this.props

    this.initialValues = {
      actionType: '',
      mintAmount: '',
      burnAmount: ''
    }

    this.validationSchema = object().shape({
      actionType: mixed().oneOf(['mint', 'burn']),
      mintAmount: number().positive().label('Amount').when('actionType', (actionType, schema) => {
        return actionType === 'mint' ? schema.required() : schema.notRequired()
      }),
      burnAmount: number().max(parseInt(balance.replace(/,/g, ''))).label('Amount').when('actionType', (actionType, schema) => {
        return actionType === 'burn' ? schema.required() : schema.notRequired()
      })
    })
  }

  onSubmit = async (values, { resetForm }) => {
    const { handleMintOrBurnClick } = this.props
    const {
      actionType
    } = values

    const amount = actionType === 'mint' ? values.mintAmount : values.burnAmount
    await handleMintOrBurnClick(actionType, amount)
    resetForm()
  }

  actionSuccess = (actionType) => {
    const { transactionStatus, mintMessage, burnMessage } = this.props
    const sharedCondition = transactionStatus && (transactionStatus === SUCCESS || transactionStatus === CONFIRMATION)
    if (actionType === 'mint') {
      return sharedCondition && mintMessage
    } else {
      return sharedCondition && burnMessage
    }
  }

  actionFailed = (actionType) => {
    const { transactionStatus, mintMessage, burnMessage } = this.props
    const sharedCondition = transactionStatus && transactionStatus === FAILURE
    if (actionType === 'mint') {
      return sharedCondition && mintMessage
    } else {
      return sharedCondition && burnMessage
    }
  }

  renderForm = ({ handleSubmit, setFieldValue, setFieldTouched, values, isSubmitting }) => {
    const {
      tokenNetworkType,
      token,
      lastAction,
      accountAddress,
      closeMintMessage,
      closeBurnMessage
    } = this.props

    const {
      actionType
    } = values

    return (
      <form className='transfer-tab__content' onSubmit={handleSubmit}>
        <Message
          message={`Your just ${lastAction && lastAction.actionType}ed ${lastAction && lastAction.mintBurnAmount} ${token.symbol} on ${tokenNetworkType} network`}
          isOpen={this.actionSuccess(actionType)}
          subTitle=''
          clickHandler={
            actionType === 'mint'
              ? closeMintMessage
              : closeBurnMessage
          }
        />
        <Message
          message={'Oops, something went wrong'}
          isOpen={this.actionFailed(actionType)}
          subTitle=''
          clickHandler={
            actionType === 'mint'
              ? closeMintMessage
              : closeBurnMessage
          }
        />
        <div className='transfer-tab__actions'>
          <button
            disabled={!isOwner(token, accountAddress)}
            className={classNames('transfer-tab__actions__btn', { 'transfer-tab__actions__btn--active': actionType === 'mint' })}
            onClick={(e) => {
              e.preventDefault()
              setFieldValue('actionType', 'mint')
            }}
          >
          Mint
          </button>
          <button
            disabled={!isOwner(token, accountAddress)}
            className={classNames('transfer-tab__actions__btn', { 'transfer-tab__actions__btn--active': actionType === 'burn' })}
            onClick={(e) => {
              e.preventDefault()
              setFieldValue('actionType', 'burn')
            }}
          >
          Burn
          </button>
        </div>
        <div className='transfer-tab__content__amount'>
          <span className='transfer-tab__content__amount__text'>Amount</span>
          {
            actionType === 'mint'
              ? (
                <Fragment>
                  <Field
                    onFocus={() => setFieldTouched('mintAmount', true)}
                    className='transfer-tab__content__amount__field'
                    type='number'
                    name='mintAmount'
                    placeholder='...'
                  />
                  <ErrorMessage name='mintAmount' render={msg => <div className='input-error'>{msg}</div>} />
                </Fragment>
              ) : (
                <Fragment>
                  <Field
                    onFocus={() => setFieldTouched('burnAmount', true)}
                    className='transfer-tab__content__amount__field'
                    name='burnAmount'
                    type='number'
                    placeholder='...'
                  />
                  <ErrorMessage name='burnAmount' render={msg => <div className='input-error'>{msg}</div>} />
                </Fragment>
              )
          }
        </div>
        <div className='transfer-tab__content__button'>
          {
            actionType && <TransactionButton type='submit' disabled={isSubmitting} frontText={upperCase(actionType)} />
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
    />
  )
}
