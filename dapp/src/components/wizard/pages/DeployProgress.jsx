import React, { PureComponent } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { fetchDeployProgress } from 'actions/token'
import isEmpty from 'lodash/isEmpty'
import FontAwesome from 'react-fontawesome'
import get from 'lodash/get'
import deployProgressSteps from 'constants/deployProgressSteps'
import FinishIssuance from 'images/finish_issuance.svg'
import { getTransaction } from 'selectors/transaction'
import { connect as connectFormik, getIn } from 'formik'
import { withNetwork } from 'containers/Web3'
import * as Sentry from '@sentry/browser'

class DeployProgress extends PureComponent {
  state = {
    hasErrors: false
  }

  componentDidMount () {
    if (this.props.deployResponse) {
      const { fetchDeployProgress, deployResponse } = this.props
      if (deployResponse && deployResponse.id) {
        const { id } = deployResponse
        fetchDeployProgress(id)
        this.interval = setInterval(() => fetchDeployProgress(id), 3000)
      }
    }
  }

  componentDidUpdate (prevProps) {
    if ((this.props.deployResponse !== prevProps.deployResponse) && this.props.deployResponse) {
      const { fetchDeployProgress, deployResponse } = this.props
      if (deployResponse && deployResponse.id) {
        const { id } = deployResponse
        fetchDeployProgress(id)
        this.interval = setInterval(() => fetchDeployProgress(id), 3000)
      }
    }

    if (this.props.steps !== prevProps.steps) {
      const { steps, stepErrors, setNextStep, communityAddress } = this.props
      const allDone = Object.values(steps).every(val => val)
      const { done } = steps
      if (allDone && done) {
        clearInterval(this.interval)
        window.analytics.track('A new community has been created', {
          action: 'New community',
          category: 'Issuance',
          communityAddress
        })
        setTimeout(() => {
          setNextStep()
        }, 1000)
      }

      if ((!isEmpty(stepErrors) && (stepErrors.bridge || stepErrors.community))) {
        clearInterval(this.interval)
        try {
          const keys = Object.keys(stepErrors).filter(stepName => stepErrors && stepErrors[stepName])
          window.analytics.track(`Error in step ${keys && keys[0]}`, {
            category: 'Issuance',
            action: 'Stop deployment process'
          })
        } catch (error) {
          window.analytics.track(`Error`, {
            error: error,
            category: 'Issuance',
            action: 'Stop deployment process'
          })
          Sentry.captureException(error)
        }
        this.setState({ hasErrors: true })
      }
    }
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  stepHasError = (step) => {
    const { stepErrors } = this.props
    return get(stepErrors, [`${step}`], false)
  }

  refreshPage = () => {
    window.location.reload(true)
  }

  render () {
    const {
      formik,
      steps,
      networkType,
      transactionHash
    } = this.props

    const {
      hasErrors
    } = this.state

    let currentStep = null

    const isFalsy = Object.values(steps).every(val => !val)
    const contracts = getIn(formik.values, 'contracts')

    const { done } = steps

    if (isFalsy) {
      currentStep = 'tokenIssued'
    } else {
      currentStep = Object.keys(steps)
        .filter((contractName) => !steps[contractName])[0]
    }

    return (
      <div className='progress__wrapper'>
        <div className='progress__title'>Please wait while your contracts are being published to Ethereum and verification received.</div>
        <div className='progress__img'>
          {
            !done ? (
              <div className={classNames('progress__loader', { 'progress__loader--stop': hasErrors })} />
            ) : (
              <img src={FinishIssuance} alt='finish' />
            )
          }
        </div>
        {
          deployProgressSteps
            .filter(({ key }) => key === 'tokenIssued' || contracts[key].checked)
            .map(({ label, loaderText, key, RenderLink }) => {
              return (
                <div key={key} className={classNames('progress__item', { 'progress__item--active': currentStep === key && !this.stepHasError(key) })}>
                  <div className={classNames('progress__item__label')}>
                    { steps && steps[key] && <FontAwesome name='check' /> }
                    { this.stepHasError(key) && <FontAwesome name='times' /> }
                    {label}
                    {RenderLink && transactionHash ? <RenderLink txHash={transactionHash} /> : null}
                  </div>
                  {
                    currentStep === key &&
                    !this.stepHasError(key) &&
                    <div className='progress__item__loaderText'>{typeof loaderText === 'function' ? loaderText(networkType) : loaderText}</div>
                  }
                </div>
              )
            })
        }
        {
          hasErrors && (
            <div className='progress__error'>
              <p>The process has failed, please start over</p>
              <button className='button button--normal' type='button' onClick={this.refreshPage}>Try again</button>
            </div>
          )
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  transactionHash: get(getTransaction(state, state.screens.issuance.transactionHash), 'transactionHash'),
  ...state.screens.issuance
})

const mapDispatchToProps = {
  fetchDeployProgress
}

export default connect(mapStateToProps, mapDispatchToProps)(connectFormik(withNetwork(DeployProgress)))
