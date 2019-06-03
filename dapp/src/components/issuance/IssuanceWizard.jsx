import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { nameToSymbol } from 'utils/format'
import StepsIndicator from './StepsIndicator'
import NameCurrencyStep from './NameCurrencyStep'
import DetailsStep from './DetailsStep'
import SummaryStep from './SummaryStep'
import { getAccountAddress } from 'selectors/accounts'
import Contracts from './Contracts'
import { createTokenWithMetadata, fetchDeployProgress, deployExistingToken } from 'actions/token'
import ReactGA from 'services/ga'
import Logo from 'components/Logo'

class IssuanceWizard extends Component {
  state = {
    activeStep: 0,
    communityName: '',
    communitySymbol: '',
    customSupply: '',
    communityType: {},
    existingToken: {},
    totalSupply: '',
    communityLogo: {},
    stepPosition: {},
    scrollPosition: 0,
    contracts: {
      community: {
        label: 'Members list',
        checked: true,
        key: 'community'
      },
      bridge: {
        label: 'Bridge to fuse',
        checked: true,
        key: 'bridge'
      },
      transferOwnership: {
        label: 'Transfer ownership',
        checked: true,
        key: 'transferOwnership'
      }
    },
    isOpen: false,
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
    const { contracts, isOpen, communityType } = this.state
    const { deployExistingToken, createTokenWithMetadata, adminAddress } = this.props

    const steps = Object.keys(contracts)
      .filter((contractName) => contracts[contractName].checked)
      .reduce((steps, contractName) => ({
        ...steps,
        [contracts[contractName].key]: contracts[contractName].key === 'bridge'
          ? { args: { foreignTokenAddress: null } }
          : contracts[contractName].key === 'community'
            ? { args: { isClosed: !isOpen, name: this.state.communityName, adminAddress } }
            : {}
      }), {})

    const metadata = { communityLogo: this.state.communityLogo.name }
    if (communityType && communityType.value === 'existingToken') {
      const { existingToken: { value: foreignTokenAddress } } = this.state
      const newSteps = { ...steps, bridge: { args: { foreignTokenAddress } } }
      deployExistingToken(newSteps)
    } else {
      createTokenWithMetadata(tokenData, metadata, this.state.communityType.value, steps)
    }
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

  setCommunityType = communityType =>
    this.setState({ communityType })

  setExistingToken = existingToken =>
    this.setState({ existingToken })

  setTotalSupply = supply =>
    this.setState({ totalSupply: supply })

  setCommunityLogo = logo =>
    this.setState({ communityLogo: logo })

  setCommunityPrivacy = isOpen =>
    this.setState({ isOpen })

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
      currentDeploy,
      isOpen,
      existingToken
    } = this.state

    switch (activeStep) {
      case 0:
        return (
          <NameCurrencyStep
            networkType={foreignNetwork}
            communityName={communityName}
            handleChangeCommunityName={this.handleChangeCommunityName}
            setNextStep={this.setNextStep}
            communityType={communityType}
            setCommunityType={this.setCommunityType}
            setExistingToken={this.setExistingToken}
            existingToken={existingToken}
          />
        )
      case 1:
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
            communityName={communityName}
            handleChangeCommunitySymbol={this.handleChangeCommunitySymbol}
          />
        )
      case 2:
        return (
          <Contracts
            isOpen={isOpen}
            setCommunityPrivacy={this.setCommunityPrivacy}
            contracts={contracts}
            setNextStep={this.setNextStep}
          />
        )
      case 3:
        return (
          <SummaryStep
            isOpen={isOpen}
            networkType={foreignNetwork}
            createTokenSignature={createTokenSignature}
            contracts={contracts}
            communityName={communityName}
            communityLogo={communityLogo.name}
            totalSupply={totalSupply}
            communitySymbol={communitySymbol}
            setNextStep={this.setNextStep}
            showPopup={this.showMetamaskPopup}
            communityType={communityType}
            transactionStatus={transactionStatus}
            existingToken={existingToken}
            history={history}
            currentDeploy={currentDeploy}
          />
        )
    }
  }

  render () {
    const { history, foreignNetwork } = this.props
    const { communityType } = this.state
    const steps = ['Name & currency', communityType && communityType.value === 'existingToken' ? 'Symbol and logo' : 'Attributes', 'Contracts', 'Summary']

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
            this.state.activeStep > 0 && (
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
  foreignNetwork: state.network.foreignNetwork,
  adminAddress: getAccountAddress(state)
})

const mapDispatchToProps = {
  createTokenWithMetadata,
  fetchDeployProgress,
  deployExistingToken
}

export default connect(mapStateToProps, mapDispatchToProps)(IssuanceWizard)
