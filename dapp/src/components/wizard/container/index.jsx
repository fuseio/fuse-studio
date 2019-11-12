import React, { Fragment } from 'react'
import { Formik } from 'formik'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import Logo from 'components/common/Logo'
import classNames from 'classnames'
import FontAwesome from 'react-fontawesome'
import TransactionButton from 'components/common/TransactionButton'
import { PENDING, FAILURE, REQUEST } from 'actions/constants'

const nextStepEvents = {
  0: 'Next step - 1',
  1: 'Next step - 2',
  2: 'Next step - 3'
}

const validations = {
  0: ['communityName', 'communityType', 'existingToken', 'email'],
  1: ['totalSupply', 'communitySymbol', 'images.chosen'],
  2: ['isOpen']
}

const getStep = (communityType) => (['Name & currency', communityType ? 'Symbol and logo' : 'Attributes', 'Contracts', 'Summary'])

const StepsIndicator = ({ steps, activeStep }) => {
  return steps.map((item, index) => {
    const stepsClassStyle = classNames('cell large-2 medium-2 small-4 step', {
      [`step--active`]: index === activeStep,
      [`step--done`]: index < activeStep
    })
    return (
      <div key={index} className={stepsClassStyle} />
    )
  })
}

class Wizard extends React.Component {
  static Page = ({ children, ...rest }) => {
    return React.Children.map(children, child => React.cloneElement(child, { ...rest }))
  }

  constructor (props) {
    super(props)

    this.state = {
      page: 0,
      validationSchema: props.validationSchema,
      values: props.initialValues
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.transactionStatus === PENDING && prevProps.transactionStatus === REQUEST) {
      this.next(this.state.values)
    }
  }

  next = (values) => {
    if (validations[this.state.page]) {
      const currentStepFields = validations[this.state.page]
      const trackProps = currentStepFields.reduce((acc, key) => {
        acc = values[key] ? {
          ...acc,
          [key]: get(values, `${key}.value`)
            ? `${get(values, `${key}.value`)}`
            : get(values, key)
        } : {
          ...acc
        }
        return acc
      }, {})
      if (window && window.analytics) {
        window.analytics.track(nextStepEvents[this.state.page], { ...trackProps })
      }
    }
    this.setState(state => ({
      page: Math.min(state.page + 1, this.props.children.length - 1),
      values
    }))
  }

  previous = () =>
    this.setState(state => ({
      page: Math.max(state.page - 1, 0)
    }))

  onSubmit = (values, bag) => {
    const { children, submitHandler } = this.props
    const { page } = this.state
    const isSubmitStep = get(React.Children.toArray(children)[page].props, 'isSubmitStep')

    if (isSubmitStep) {
      if (window && window.analytics) {
        window.analytics.track('Issue pressed')
      }
      return submitHandler(values, bag)
    } else {
      bag.setTouched({})
      bag.setSubmitting(false)
      this.next(values)
    }
  }

  stepValidator = (keys, errors) => {
    if (!isEmpty(keys)) {
      return keys.some((key) => get(errors, key))
    }
    return false
  }

  renderForm = ({ values, handleSubmit, errors, isValid }) => {
    const { children, transactionStatus, createTokenSignature } = this.props
    const { page } = this.state
    const activePage = React.cloneElement(React.Children.toArray(children)[page], {
      setNextStep: () => this.next(values),
      previous: () => this.previous()
    })
    const isLastPage = page === React.Children.count(children) - 1
    const isSubmitStep = get(React.Children.toArray(children)[page].props, 'isSubmitStep')

    return (
      <form className={classNames('issuance__wizard', { 'issuance__wizard--opacity': ((createTokenSignature) || (transactionStatus === FAILURE)) })} onSubmit={handleSubmit}>
        { page < 3 && <h1 className='issuance__wizard__title'>Launch your community</h1>}
        {isSubmitStep && <h1 className='issuance__wizard__title'>Review and Sign</h1>}
        {page === 4 && <h1 className='issuance__wizard__title'>Issuance process</h1>}
        {activePage}
        <div className='issuance__wizard__buttons'>
          {!isLastPage && !isSubmitStep && page < 4 && (
            <div className='grid-x align-center next'>
              <button disabled={this.stepValidator(validations[page], errors)} onClick={() => this.next(values)} type='button' className='button button--normal'>Next</button>
            </div>
          )}
          {isSubmitStep && (
            <div className='grid-x align-center summary-step__issue'>
              <TransactionButton disabled={!isValid} clickHandler={handleSubmit} type='submit' frontText='ISSUE' />
            </div>
          )}
          {page > 0 && !isLastPage && ((transactionStatus !== PENDING) && (transactionStatus !== REQUEST)) && (
            <button
              type='button'
              className='issuance__wizard__back'
              onClick={this.previous}
            >
              Back
            </button>
          )}
        </div>
      </form>
    )
  }

  render () {
    const { history } = this.props
    const { page, values, validationSchema } = this.state

    return (
      <Fragment>
        <div className='issuance__wrapper'>
          <div className='issuance__header grid-x align-justify'>
            <div onClick={() => history.push('/')} className='issuance__header__logo align-self-middle grid-x align-middle'>
              <Logo isGradientLogo />
            </div>
            <div className='issuance__header__indicators grid-x cell align-center' ref={stepIndicator => (this.stepIndicator = stepIndicator)}>
              <div className='grid-y cell auto'>
                <h4 className='issuance__header__current'>{getStep(values.communityType)[page] || getStep(values.communityType)[page - 1]}</h4>
                <div className='grid-x align-center'>
                  <StepsIndicator
                    steps={getStep(values.communityType)}
                    activeStep={page}
                  />
                </div>
              </div>
            </div>
            <div
              onClick={() => history.push('/')}
              className='issuance__header__close align-self-middle grid-x align-middle align-right'>
              <FontAwesome name='times' />
            </div>
          </div>
          <Formik
            initialValues={values}
            onSubmit={this.onSubmit}
            validationSchema={validationSchema}
            render={this.renderForm}
            initialStatus={false}
            validateOnChange
            isInitialValid={false}
          />
        </div>
      </Fragment>
    )
  }
}

export default withRouter(Wizard)
