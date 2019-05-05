import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { nameToSymbol } from 'utils/format'
import StepsIndicator from './StepsIndicator'
import NameStep from './NameStep'
import SymbolStep from './SymbolStep'
import DetailsStep from './DetailsStep'
import SummaryStep from './SummaryStep'
import DeployProgress from './DeployProgress'
import Contracts from './Contracts'
import { createTokenWithMetadata, fetchDeployProgress } from 'actions/token'
import ReactGA from 'services/ga'
import Logo from 'components/Logo'

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
    scrollPosition: 0,
    contracts: {
      bridge: {
        label: 'Bridge to fuse',
        checked: true,
        key: 'bridge'
      },
      membersList: {
        label: 'Members list',
        checked: false,
        key: 'membersList'
      }
    },
    currentDeploy: 'tokenIssued'
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
    const { contracts } = this.state
    const steps = Object.keys(contracts)
      .filter((contractName) => contracts[contractName].checked)
      .reduce((steps, contractName) => {
        steps = {
          ...steps,
          [contracts[contractName].key]: true
        }
        return steps
      }, {})

    const metadata = { communityLogo: this.state.communityLogo.name }
    this.props.createTokenWithMetadata(tokenData, metadata, this.state.communityType.value, steps)
  }

  handleScroll = () => this.setState({ scrollPosition: window.scrollY })

  handleChangeCommunityName = (event) => {
    this.setState({ communityName: event.target.value })
    this.setState({ communitySymbol: nameToSymbol(event.target.value) })
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
    this.setState({ communitySymbol })
  }

  showMetamaskPopup = () => this.setIssuanceTransaction()

  setCommunityType = type =>
    this.setState({ communityType: type })

  setTotalSupply = supply =>
    this.setState({ totalSupply: supply })

  setCommunityLogo = logo =>
    this.setState({ communityLogo: logo })

  setContracts = ({ key, value, label }) => {
    const {
      contracts
    } = this.state

    this.setState({ contracts: { ...contracts, [key]: { ...contracts[key], checked: value } } })
  }

  renderStepContent = () => {
    const {
      transactionStatus,
      createTokenSignature,
      foreignNetwork,
      history
    } = this.props

    const {
      communityName,
      communityType,
      communityLogo,
      activeStep,
      communitySymbol,
      totalSupply,
      contracts,
      currentDeploy
    } = this.state

    switch (activeStep) {
      case 0:
        return (
          <NameStep
            communityName={communityName}
            handleChangeCommunityName={this.handleChangeCommunityName}
            setNextStep={this.setNextStep}
          />
        )
      case 1:
        return (
          <SymbolStep
            communityName={communityName}
            setNextStep={this.setNextStep}
            handleChangeCommunitySymbol={this.handleChangeCommunitySymbol}
            communitySymbol={communitySymbol}
          />
        )
      case 2:
        return (
          <DetailsStep
            networkType={foreignNetwork}
            communityType={communityType}
            setCommunityType={this.setCommunityType}
            totalSupply={totalSupply}
            setTotalSupply={this.setTotalSupply}
            communitySymbol={communitySymbol}
            communityLogo={communityLogo}
            setCommunityLogo={this.setCommunityLogo}
            setNextStep={this.setNextStep}
          />
        )
      case 3:
        return (
          <Contracts
            contracts={contracts}
            setContracts={this.setContracts}
            setNextStep={this.setNextStep}
          />
        )
      case 4:
        return (
          <SummaryStep
            networkType={foreignNetwork}
            createTokenSignature={createTokenSignature}
            contracts={contracts}
            communityName={communityName}
            communityLogo={communityLogo.name}
            totalSupply={totalSupply}
            communitySymbol={communitySymbol}
            setNextStep={this.setNextStep}
            showPopup={this.showMetamaskPopup}
            transactionStatus={transactionStatus}
          />
        )
      case 5:
        return (
          <DeployProgress
            history={history}
            contracts={contracts}
            currentDeploy={currentDeploy}
          />
        )
    }
  }

  render () {
    const { history, foreignNetwork } = this.props
    const steps = ['Name', 'Symbol', 'Attributes', 'Contracts', 'Summary']

    return (
      <div className={classNames(`issuance-${foreignNetwork}__wrapper`)}>
        <div className={classNames(`issuance-${foreignNetwork}__header grid-x align-middle align-justify`)}>
          <div onClick={() => history.push('/')} className={classNames(`issuance-${foreignNetwork}__header__logo grid-x align-middle`)}>
            <Logo />
          </div>
          <div className={classNames(`issuance-${foreignNetwork}__header__indicators grid-x cell align-center`)} ref={stepIndicator => (this.stepIndicator = stepIndicator)}>
            <div className='grid-y cell auto'>
              <h4 className={classNames(`issuance-${foreignNetwork}__header__current`)}>{steps[this.state.activeStep] || steps[this.state.activeStep - 1]}</h4>
              <div className='grid-x align-center'>
                <StepsIndicator
                  network={foreignNetwork}
                  steps={steps}
                  activeStep={this.state.activeStep}
                />
              </div>
            </div>
          </div>
          <div onClick={() => history.push('/')} className={classNames(`issuance-${foreignNetwork}__header__close grid-x align-middle align-right`)}>
            <FontAwesome name='times' />
          </div>
        </div>
        <div className={classNames(`issuance-${foreignNetwork}__wizard`)}>
          {this.renderStepContent()}
          {
            this.state.activeStep > 0 && this.state.activeStep < 5 && (
              <div className='text-center'>
                <button
                  className={classNames(`issuance-${foreignNetwork}__wizard__back`)}
                  onClick={this.setPreviousStep}>Back
                </button>
              </div>
            )
          }
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
  foreignNetwork: state.network.foreignNetwork
})

const mapDispatchToProps = {
  createTokenWithMetadata,
  fetchDeployProgress
}

export default connect(mapStateToProps, mapDispatchToProps)(IssuanceWizard)
