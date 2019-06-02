import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { isMobileOnly } from 'react-device-detect'
import TotalSupply from './TotalSupply'
import LogosOptions from './LogosOptions'
import FontAwesome from 'react-fontawesome'
import SymbolStep from './SymbolStep'

export default class DetailsStep extends Component {
  constructor (props) {
    super(props)

    const { communityType } = props
    this.state = {
      currentStep: communityType && communityType.value !== 'existingToken' ? 0 : 1
    }
  }

  checkCondition = (evt, condition) => {
    if (condition) {
      evt.preventDefault()
    }
  }

  mobileLayout = () => {
    const {
      communityType,
      communityLogo,
      setCommunityLogo,
      communitySymbol,
      setTotalSupply,
      setNextStep,
      totalSupply,
      networkType,
      handleChangeCommunitySymbol,
      communityName
    } = this.props

    const { currentStep } = this.state

    switch (currentStep) {
      case 0:
        return <TotalSupply
          checkCondition={this.checkCondition}
          communityType={communityType}
          communityLogo={communityLogo}
          setNextStep={() => this.setState({ currentStep: 1 })}
          setTotalSupply={setTotalSupply}
          totalSupply={totalSupply}
        />
      case 1:
        return (
          <Fragment>
            <SymbolStep
              handleChangeCommunitySymbol={handleChangeCommunitySymbol}
              communityName={communityName}
              communityType={communityType}
              communitySymbol={communitySymbol}
            />
            {isMobileOnly && <div className='line' ><hr /></div>}
            <LogosOptions
              communityType={communityType}
              networkType={networkType}
              communityLogo={communityLogo}
              setCommunityLogo={setCommunityLogo}
              communitySymbol={communitySymbol}
            />
            <div className='grid-x align-center attributes__next'>
              <button
                className='button button--big'
                disabled={
                  this.validateStep()
                }
                onClick={setNextStep}
              >
                NEXT
                <FontAwesome className='symbol-icon' name='angle-right' />
              </button>
            </div>
          </Fragment>
        )
    }
  }

  validateStep = () => {
    const {
      communityType,
      totalSupply,
      communityLogo
    } = this.props

    if (communityType && communityType.value !== 'existingToken') {
      return Object.keys(communityType).length === 0 || totalSupply < 0 || totalSupply === '0' || !totalSupply || !communityLogo.name
    } else {
      return Object.keys(communityType).length === 0 || !communityLogo.name
    }
  }

  mainLayout = () => {
    const {
      communityName,
      communityType,
      communityLogo,
      setCommunityLogo,
      communitySymbol,
      setTotalSupply,
      setNextStep,
      totalSupply,
      networkType,
      handleChangeCommunitySymbol
    } = this.props

    return (
      <Fragment>
        {
          communityType && communityType.value !== 'existingToken' && (
            <TotalSupply
              checkCondition={this.checkCondition}
              communityType={communityType}
              communityLogo={communityLogo}
              setNextStep={setNextStep}
              setTotalSupply={setTotalSupply}
              totalSupply={totalSupply}
            />
          )
        }
        <SymbolStep
          handleChangeCommunitySymbol={handleChangeCommunitySymbol}
          communityName={communityName}
          communityType={communityType}
          communitySymbol={communitySymbol}
        />
        <LogosOptions
          communityType={communityType}
          networkType={networkType}
          communityLogo={communityLogo}
          setCommunityLogo={setCommunityLogo}
          communitySymbol={communitySymbol}
        />
        <div className='grid-x align-center attributes__next'>
          <button
            className='button button--big'
            disabled={
              this.validateStep()
            }
            onClick={setNextStep}
          >
            NEXT
            <FontAwesome className='symbol-icon' name='angle-right' />
          </button>
        </div>
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
