import React, {Component} from 'react'
import FontAwesome from 'react-fontawesome'
import classNames from 'classnames'
import {connect} from 'react-redux'
import {BigNumber} from 'bignumber.js'
import StepsIndicator from './StepsIndicator'
import NameStep from './NameStep'
import SymbolStep from './SymbolStep'
import DetailsStep from './DetailsStep'
import SummaryStep from './SummaryStep'
import { nameToSymbol } from 'utils/format'
import * as actions from 'actions/communities'

class Issuance extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeStep: 0,
      doneStep: null,
      communityName: '',
      communitySymbol: '',
      customSupply: '',
      communityType: {},
      totalSupply: '',
      communityLogo: {},
      stepPosition: {},
      scrollPosition: 0
    }
    this.handleChangeCommunityName = this.handleChangeCommunityName.bind(this)
    this.handleChangeCommunitySymbol = this.handleChangeCommunitySymbol.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll)
    this.setState({ stepPosition: this.stepIndicator.getBoundingClientRect().top })
    window.addEventListener('keypress', this.handleKeyPress)
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      switch (this.state.activeStep) {
        case 0: return this.state.communityName.length > 2 ? this.setNextStep() : null
        case 1: return this.setNextStep()
        case 2: return (this.state.customSupply !== '' || this.state.totalSupply !== '') &&
        Object.keys(this.state.communityType).length !== 0 && this.state.communityLogo !== ''
          ? this.setNextStep() : null
      }
    }
  }

  componentWillUnmount () {
    if (this.state.scrollPosition) {
      window.removeEventListener('scroll', this.handleScroll, false)
    }
  }

  setIssuanceTransaction = (communityName, symbol, communityType, communityLogo, totalSupply) => {
    const currencyData = {
      name: communityName,
      symbol: symbol,
      decimals: 18,
      totalSupply: new BigNumber(totalSupply).multipliedBy(1e18)
    }
    const communityMetadata = {'communityType': communityType.text, 'communityLogo': communityLogo.name}
    this.props.issueCommunity(communityMetadata, currencyData)
  }

  handleScroll = () => {
    this.setState({scrollPosition: window.scrollY})
  }

  setQuitIssuance () {
    this.props.history.goBack()
  }

  handleChangeCommunityName (event) {
    this.setState({communityName: event.target.value})
    this.setState({communitySymbol: nameToSymbol(event.target.value)})
  }

  setPreviousStep = () => {
    this.setState({
      activeStep: this.state.activeStep - 1
    })
  }

  setNextStep () {
    this.setState({
      doneStep: this.state.activeStep,
      activeStep: this.state.activeStep + 1
    })
  }

  handleChangeCommunitySymbol (event) {
    this.setState({communitySymbol: event.target.value})
  }

  setCommunityType = type =>
    this.setState({communityType: type})

  setTotalSupply = supply =>
    this.setState({totalSupply: supply})

  setCommunityLogo = logo =>
    this.setState({communityLogo: logo})

  renderStepContent (activeStep, name, communityType, communityLogo) {
    switch (activeStep) {
      case 0:
        return (
          <NameStep
            communityName={name}
            handleChangeCommunityName={this.handleChangeCommunityName}
            setNextStep={() => this.setNextStep()}
          />
        )
      case 1:
        return (
          <SymbolStep
            communityName={name}
            setNextStep={() => this.setNextStep()}
            handleChangeCommunitySymbol={this.handleChangeCommunitySymbol}
            communitySymbol={this.state.communitySymbol}
          />
        )
      case 2:
        return (
          <DetailsStep
            communityType={this.state.communityType}
            setCommunityType={this.setCommunityType}
            totalSupply={this.state.totalSupply}
            setTotalSupply={this.setTotalSupply}
            communitySymbol={this.state.communitySymbol}
            communityLogo={this.state.communityLogo}
            setCommunityLogo={this.setCommunityLogo}
            setNextStep={() => this.setNextStep()}
          />
        )
      case 3:
        return (
          <SummaryStep
            communityName={name}
            communityLogo={this.state.communityLogo.icon}
            totalSupply={this.state.totalSupply}
            communitySymbol={this.state.communitySymbol}
            setIssuanceTransaction={() => this.setIssuanceTransaction(name, nameToSymbol(name), communityType, communityLogo, this.state.totalSupply)}
          />
        )
    }
  }

  render () {
    const steps = ['Name', 'Symbol', 'Details', 'Summary']
    const stepIndicatorInset = 35
    const stepsIndicatorClassStyle = classNames({
      'steps-indicator': true,
      'step-sticky': (this.state.scrollPosition > this.state.stepPosition - stepIndicatorInset)
    })
    const stepsContainerClassStyle = classNames({
      'steps-container': true,
      'step-with-sticky': (this.state.scrollPosition > this.state.stepPosition - stepIndicatorInset)
    })
    return (
      <div className='issuance-form-wrapper' ref={wrapper => (this.wrapper = wrapper)}>
        <div className='issuance-container'>
          <div className='issuance-control'>
            {this.state.activeStep > 0 && <button
              className='prev-button ctrl-btn'
              onClick={this.setPreviousStep}
            >
              <FontAwesome className='ctrl-icon' name='arrow-left' />
              <span className='btn-text'>Back</span>
            </button>}
            <button
              className='quit-button ctrl-btn'
              onClick={() => this.setQuitIssuance()}
            >
              <FontAwesome className='ctrl-icon' name='times' />
              <span className='btn-text'>Quit</span>
            </button>
          </div>
          <div className={stepsContainerClassStyle} >
            <div className={stepsIndicatorClassStyle} ref={stepIndicator => (this.stepIndicator = stepIndicator)}>
              <StepsIndicator
                steps={steps}
                activeStep={this.state.activeStep}
                doneStep={this.state.doneStep}
              />
            </div>
          </div>
          <div className='step-content'>
            {this.renderStepContent(this.state.activeStep, this.state.communityName, this.state.communityType, this.state.communityLogo)}
          </div>
        </div>
      </div>
    )
  }
}

export default connect(null, actions)(Issuance)
