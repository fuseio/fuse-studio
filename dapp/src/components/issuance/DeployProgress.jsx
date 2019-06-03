import React, { PureComponent } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { fetchDeployProgress } from 'actions/token'
import isEmpty from 'lodash/isEmpty'
import FontAwesome from 'react-fontawesome'
import get from 'lodash/get'
import deployProgressSteps from 'constants/deployProgressSteps'

const Congratulations = ({ goToDashboard }) => {
  return (
    <div className='congratulation'>
      <div className='congratulation__title'>
        Congratulations!
      </div>
      <div className='congratulation__sub-title'>Your community is ready to be born!</div>
      <div className='congratulation__what'>What should i do next?</div>
      <div className='congratulation__text'>to start building your community. Your community will now show on the homepage of the Fuse Studio. Go to your community page to start adding businesses and users.</div>
      <div className='congratulation__btn'>
        <button className='button button--big' onClick={goToDashboard}>Go to the community page</button>
      </div>
    </div>
  )
}

class DeployProgress extends PureComponent {
  state = {
    isReady: false,
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
      const { steps, stepErrors } = this.props
      const values = Object.values(steps).every(val => val)

      if (values) {
        clearInterval(this.interval)
        this.setState({ isReady: true })
      }

      if ((!isEmpty(stepErrors) && (stepErrors.bridge || stepErrors.community))) {
        clearInterval(this.interval)
        this.setState({ hasErrors: true })
      }
    }
  }

  goToDashboard = () => {
    const { history, foreignNetwork, communityAddress } = this.props
    history.push(`/view/dashboard/${foreignNetwork}/${communityAddress}`)
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
      steps
    } = this.props

    const {
      isReady,
      hasErrors
    } = this.state

    let currentStep = null

    const isFalsy = Object.values(steps).every(val => !val)

    if (isFalsy) {
      currentStep = 'tokenIssued'
    } else {
      currentStep = Object.keys(steps)
        .filter((contractName) => !steps[contractName])[0]
    }

    return (
      <div className='progress__wrapper'>
        <div className='progress__img'>
          <div className={classNames('progress__loader', { 'progress__loader--stop': hasErrors })} />
        </div>
        {
          deployProgressSteps
            .filter(({ key }) => key === 'tokenIssued' || contracts[key].checked)
            .map(({ label, loaderText, key }) => {
              return (
                <div key={key} className={classNames('progress__item', { 'progress__item--active': currentStep === key && !this.stepHasError(key) })}>
                  <div className={classNames('progress__item__label')}>
                    { steps && steps[key] && <FontAwesome name='check' /> }
                    { this.stepHasError(key) && <FontAwesome name='times' /> }
                    {label}
                  </div>
                  {
                    currentStep === key &&
                    !this.stepHasError(key) &&
                    <div className='progress__item__loaderText'>{loaderText}</div>
                  }
                </div>
              )
            })
        }
        {isReady && <Congratulations goToDashboard={this.goToDashboard} />}
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
  ...state.screens.issuance,
  foreignNetwork: state.network.foreignNetwork
})

const mapDispatchToProps = {
  fetchDeployProgress
}

export default connect(mapStateToProps, mapDispatchToProps)(DeployProgress)
