import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { fetchDeployProgress } from 'actions/token'
import isEmpty from 'lodash/isEmpty'
import FontAwesome from 'react-fontawesome'

const deployProgress = [
  {
    label: 'Issuing community currency',
    loaderText: 'Your asset is being deployed as an ERC-20 contract to Ethereum mainnet',
    key: 'tokenIssued'
  },
  {
    label: 'Deploying bridge contract',
    loaderText: 'A bridge contract is being deployed for the community currency on mainnet and the Fuse sidechain',
    key: 'bridge'
  },
  {
    label: 'Deploying member list contract',
    loaderText: 'The members list is deployed on the Fuse sidechain to allow adding users to the community',
    key: 'membersList'
  }
]

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

class DeployProgress extends Component {
  state = {
    isReady: false
  }

  componentDidUpdate (prevProps) {
    if ((this.props.receipt !== prevProps.receipt) && this.props.receipt) {
      const { fetchDeployProgress, receipt } = this.props
      const tokenAddress = receipt.events[0].address
      fetchDeployProgress({ tokenAddress })
      this.interval = setInterval(() => fetchDeployProgress({ tokenAddress }), 5000)
    }

    if (this.props.steps !== prevProps.steps) {
      const { steps, stepErrors } = this.props
      const values = Object.values(steps).every(val => val)

      if (((isEmpty(stepErrors) && values) || (!isEmpty(stepErrors) && (stepErrors.bridge || stepErrors.membersList)))) {
        clearInterval(this.interval)
        this.setState({ isReady: true })
      }
    }
  }

  render () {
    const {
      contracts,
      steps,
      tokenAddress,
      foreignNetwork
      // stepErrors
    } = this.props

    const {
      isReady
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
          <div className='progress__loader'><div /></div>
        </div>
        {
          deployProgress
            .filter(({ key }) => key === 'tokenIssued' || contracts[key].checked)
            .map(({ label, loaderText, key }) => {
              return (
                <div key={key} className={classNames('progress__item', { 'progress__item--active': currentStep === key })}>
                  <div className={classNames('progress__item__label')}>
                    { steps && steps[key] && <FontAwesome name='check' /> }
                    {/* TODO */}
                    {/* { stepErrors && stepErrors[key] && <FontAwesome name='times' /> } */}
                    {label}
                  </div>
                  {
                    currentStep === key && <div className='progress__item__loaderText'>{loaderText}</div>
                  }
                </div>
              )
            })
        }
        {isReady && <Congratulations goToDashboard={() => this.props.history.push(`/view/dashboard/${foreignNetwork}/${tokenAddress}`)} />}
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
