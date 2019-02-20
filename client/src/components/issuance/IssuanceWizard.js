import React, {Component} from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import classNames from 'classnames'
import {connect} from 'react-redux'
import {BigNumber} from 'bignumber.js'
import {loadModal, hideModal} from 'actions/ui'
import { nameToSymbol } from 'utils/format'
import StepsIndicator from './StepsIndicator'
import NameStep from './NameStep'
import SymbolStep from './SymbolStep'
import DetailsStep from './DetailsStep'
import SummaryStep from './SummaryStep'
import {createTokenWithMetadata} from 'actions/token'
import { getAddresses } from 'selectors/network'
import { PENDING } from 'actions/constants'
import { USER_DATA_MODAL } from 'constants/uiConstants'
import ReactGA from 'services/ga'

class IssuanceWizard extends Component {
  state = {
    activeStep: 0,
    communityName: '',
    communitySymbol: '',
    customSupply: '',
    communityType: {},
    totalSupply: '',
    communityLogo: {},
    stepPosition: {},
    scrollPosition: 0
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('keypress', this.handleKeyPress)
    this.setState({ stepPosition: this.stepIndicator.getBoundingClientRect().top })

    ReactGA.event({
      category: 'Issuance',
      action: 'Load',
      label: 'Started'
    })
  }

  componentDidUpdate (prevProps) {
    if (this.props.receipt !== prevProps.receipt) {
      this.showUserDataPopup()
    }
  }

  showUserDataPopup = () => this.props.loadModal(USER_DATA_MODAL, {
    setQuitIssuance: this.setQuitIssuance,
    receipt: this.props.receipt
  })

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
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('keypress', this.handleKeyPress)
  }

  setIssuanceTransaction = () => {
    const tokenData = {
      name: this.state.communityName,
      symbol: this.state.communitySymbol,
      totalSupply: new BigNumber(this.state.totalSupply).multipliedBy(1e18)
    }
    const metadata = {communityType: this.state.communityType.text, communityLogo: this.state.communityLogo.name}
    this.props.createTokenWithMetadata(tokenData, metadata)
  }

  handleScroll = () => this.setState({scrollPosition: window.scrollY})

  setQuitIssuance = () => this.props.history.goBack()

  handleChangeCommunityName = (event) => {
    this.setState({communityName: event.target.value})
    this.setState({communitySymbol: nameToSymbol(event.target.value)})
  }

  setPreviousStep = () =>
    this.setState({
      activeStep: this.state.activeStep - 1
    })

  setNextStep = () =>
    this.setState({
      activeStep: this.state.activeStep + 1
    })

  handleChangeCommunitySymbol = (communitySymbol) => {
    this.setState({communitySymbol})
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
            setNextStep={this.setNextStep}
          />
        )
      case 1:
        return (
          <SymbolStep
            communityName={name}
            setNextStep={this.setNextStep}
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
            setNextStep={this.setNextStep}
          />
        )
      case 3:
        return (
          <SummaryStep
            communityName={name}
            communityLogo={this.state.communityLogo.name}
            totalSupply={this.state.totalSupply}
            communitySymbol={this.state.communitySymbol}
            showPopup={this.showMetamaskPopup}
            transactionStatus={this.props.transactionStatus}
          />
        )
    }
  }

  showMetamaskPopup = () => {
    this.setIssuanceTransaction()
  }

  render () {
    const steps = ['Name', 'Symbol', 'Details', 'Summary']
    const stepIndicatorInset = 55
    const issuanceControlClassStyle = classNames({
      'issuance-control': true,
      'issuance-control-sticky': (this.state.scrollPosition > this.state.stepPosition - stepIndicatorInset)
    })
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
          <div className={issuanceControlClassStyle}>
            {this.state.activeStep > 0 && <button
              className='prev-button ctrl-btn'
              onClick={this.setPreviousStep}
            >
              <FontAwesome className='ctrl-icon' name='arrow-left' />
              <span className='btn-text'>Back</span>
            </button>}
            <button
              className='quit-button ctrl-btn'
              onClick={this.setQuitIssuance}
              disabled={this.props.transactionStatus === PENDING}
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
              />
            </div>
          </div>
          <div className='step-content'>
            {this.renderStepContent(
              this.state.activeStep,
              this.state.communityName,
              this.state.communityType,
              this.state.communityLogo
            )}
            {this.state.activeStep > 0 && <div className='text-center'>
              <button
                className='back-btn'
                onClick={this.setPreviousStep}
              >
                <FontAwesome className='next-icon' name='angle-left' /> Back
              </button>
            </div>}
          </div>
        </div>
      </div>
    )
  }
}

IssuanceWizard.propTypes = {
  transactionHash: PropTypes.string,
  receipt: PropTypes.object,
  transactionStatus: PropTypes.string
}

const mapStateToProps = (state) => ({
  ...state.screens.issuance,
  addresses: getAddresses(state)
})

const mapDispatchToProps = {
  createTokenWithMetadata,
  loadModal,
  hideModal
}

export default connect(mapStateToProps, mapDispatchToProps)(IssuanceWizard)
