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
        this.interval = setInterval(() => fetchDeployProgress(id), 5000)
      }
    }
  }

  componentDidUpdate (prevProps) {
    if ((this.props.deployResponse !== prevProps.deployResponse) && this.props.deployResponse) {
      const { fetchDeployProgress, deployResponse } = this.props
      if (deployResponse && deployResponse.id) {
        const { id } = deployResponse
        fetchDeployProgress(id)
        this.interval = setInterval(() => fetchDeployProgress(id), 5000)
      }
    }

    if (this.props.steps !== prevProps.steps) {
      const { steps, stepErrors, setNextStep } = this.props
      const allDone = Object.values(steps).every(val => val)
      const { done } = steps
      if (allDone && done) {
        clearInterval(this.interval)
        setTimeout(() => {
          setNextStep()
        }, 1000)
      }

      if ((!isEmpty(stepErrors) && (stepErrors.bridge || stepErrors.community))) {
        clearInterval(this.interval)
        this.setState({ hasErrors: true })
      }
    }
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  goToDashboard = () => {
    const { history, communityAddress } = this.props
    history.push(`/view/community/${communityAddress}/justCreated`)
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
      contracts,
      steps,
      networkType,
      transactionHash
    } = this.props

    const {
      hasErrors
    } = this.state

    let currentStep = null

    const isFalsy = Object.values(steps).every(val => !val)

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
              <button className='button button--normal' onClick={this.refreshPage}>Try again</button>
            </div>
          )
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  transactionHash: get(getTransaction(state, state.screens.issuance.transactionHash), 'transactionHash'),
  ...state.screens.issuance,
  networkType: state.network.networkType
})

const mapDispatchToProps = {
  fetchDeployProgress
}

export default connect(mapStateToProps, mapDispatchToProps)(DeployProgress)
