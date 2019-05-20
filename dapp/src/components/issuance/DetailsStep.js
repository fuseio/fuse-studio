import React, { Component, Fragment } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { isMobileOnly } from 'react-device-detect'
import TotalSupply from './TotalSupply'
import LogosOptions from './LogosOptions'
import CurrencyType from './CurrencyType'

export default class DetailsStep extends Component {
  state = {
    currentStep: 0
  }

  nextAttribute = () => {
    this.setState({
      currentStep: this.state.currentStep + 1
    })
  }

  checkCondition = (evt, condition) => {
    if (condition) {
      evt.preventDefault()
    }
  }

  getCurrentStep = () => {
    const {
      setCommunityType,
      communityType,
      communityLogo,
      setCommunityLogo,
      communitySymbol,
      setTotalSupply,
      setNextStep,
      totalSupply,
      networkType
    } = this.props

    const { currentStep } = this.state

    switch (currentStep) {
      case 0:
        return (
          <CurrencyType nextAttribute={this.nextAttribute} setCommunityType={setCommunityType} communityType={communityType} />
        )
      case 1:
        return (
          <LogosOptions networkType={networkType} nextAttribute={this.nextAttribute} communityLogo={communityLogo} setCommunityLogo={setCommunityLogo} communitySymbol={communitySymbol} />
        )
      case 2:
        return (
          <TotalSupply checkCondition={this.checkCondition} communityType={communityType} communityLogo={communityLogo} setNextStep={setNextStep} setTotalSupply={setTotalSupply} totalSupply={totalSupply} />
        )
    }
  }

  mobileLayout = () => {
    const { currentStep } = this.state
    return (
      <Fragment>
        {this.getCurrentStep()}
        <div className='attributes__progress'>
          {
            [1, 2, 3].map((item, index) => {
              const classes = classNames('attributes__progress__item', {
                'attributes__progress__item--active': index === currentStep
              })
              return (
                <span key={item} className={classes} />
              )
            })
          }
        </div>
      </Fragment>
    )
  }

  mainLayout = () => {
    const {
      setCommunityType,
      communityType,
      communityLogo,
      setCommunityLogo,
      communitySymbol,
      setTotalSupply,
      setNextStep,
      totalSupply,
      networkType
    } = this.props

    return (
      <Fragment>
        <CurrencyType
          setCommunityType={setCommunityType}
          communityType={communityType}
        />
        <LogosOptions
          networkType={networkType}
          communityLogo={communityLogo}
          setCommunityLogo={setCommunityLogo}
          communitySymbol={communitySymbol}
        />
        <TotalSupply
          checkCondition={this.checkCondition}
          communityType={communityType}
          communityLogo={communityLogo}
          setNextStep={setNextStep}
          setTotalSupply={setTotalSupply}
          totalSupply={totalSupply}
        />
      </Fragment>
    )
  }

  render () {
    return (
      <div className='attributes'>
        {
          !isMobileOnly
            ? this.mainLayout()
            : this.mobileLayout()
        }
      </div>
    )
  }
}

DetailsStep.propTypes = {
  communityType: PropTypes.object,
  setCommunityType: PropTypes.func.isRequired,
  communityName: PropTypes.string,
  totalSupply: PropTypes.any,
  setTotalSupply: PropTypes.func.isRequired,
  communityLogo: PropTypes.object,
  communitySymbol: PropTypes.string,
  setCommunityLogo: PropTypes.func.isRequired,
  setNextStep: PropTypes.func.isRequired
}
