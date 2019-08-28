import React, { PureComponent, Fragment } from 'react'
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
import DeployProgress from './DeployProgress'
import { createTokenWithMetadata, fetchDeployProgress, deployExistingToken, clearTransaction } from 'actions/token'
// import ReactGA from 'services/ga'
import Logo from 'components/common/Logo'
import { PENDING, REQUEST, FAILURE, SUCCESS } from 'actions/constants'
import Message from 'components/common/SignMessage'
import Congratulations from 'components/issuance/Congratulations'
import { WRONG_NETWORK_MODAL } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import BridgeIcon from 'images/Bridge.svg'
import contractIcon from 'images/contract.svg'

class IssuanceWizard extends PureComponent {
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
    images: {},
    scrollPosition: 0,
    contracts: {
      community: {
        label: 'Members list',
        checked: true,
        key: 'community',
        icon: contractIcon
      },
      bridge: {
        label: 'Bridge to fuse',
        checked: true,
        key: 'bridge',
        icon: BridgeIcon
      },
      transferOwnership: {
        label: 'Transfer ownership',
        checked: true,
        key: 'transferOwnership',
        icon: contractIcon
      },
      funder: {
        label: 'Gifting fuse tokens',
        checked: true,
        key: 'funder',
        icon: contractIcon
      }
    },
    isOpen: false,
    currentDeploy: 'tokenIssued'
  }

  componentDidMount () {
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('keypress', this.handleKeyPress)
    this.setState({ stepPosition: this.stepIndicator.getBoundingClientRect().top })

    // ReactGA.event({
    //   category: 'Issuance',
    //   action: 'Load',
    //   label: 'Started'
    // })
  }

  componentDidUpdate (prevProps) {
    if (this.props.transactionStatus === SUCCESS && prevProps.transactionStatus !== SUCCESS) {
      // ReactGA.event({
      //   category: 'Issuance',
      //   action: 'Load',
      //   label: 'Issued'
      // })
    }
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('keypress', this.handleKeyPress)
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

    const metadata = { communityLogo: this.state.communityLogo.name, image: this.state.images.blob }
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

  onlyOnForeign = (successFunc) => {
    const { networkType } = this.props
    if (networkType === 'ropsten' || networkType === 'main') {
      successFunc()
    } else {
      const { loadModal } = this.props
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['ropsten', 'mainnet'] })
    }
  }

  showMetamaskPopup = () => this.onlyOnForeign(this.setIssuanceTransaction)

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

  setImages = (images) =>
    this.setState({ images })

  transactionDenied = () => {
    const { error, transactionStatus } = this.props
    return transactionStatus && transactionStatus === 'FAILURE' && error && typeof error.includes === 'function' && error.includes('denied')
  }

  goToDashboard = () => {
    const { history, communityAddress } = this.props
    history.push(`/view/community/${communityAddress}`)
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
      currentDeploy,
      isOpen,
      existingToken,
      images
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
            setImages={this.setImages}
            images={images}
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
            images={images}
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
      case 4:
        return (
          <DeployProgress
            setNextStep={this.setNextStep}
            history={history}
            contracts={contracts}
            currentDeploy={currentDeploy}
          />
        )
      case 5:
        return (
          <Congratulations goToDashboard={this.goToDashboard} />
        )
    }
  }

  render () {
    const { history, transactionStatus, createTokenSignature, clearTransaction } = this.props
    const { communityType } = this.state
    const steps = ['Name & currency', communityType && communityType.value === 'existingToken' ? 'Symbol and logo' : 'Attributes', 'Contracts', 'Summary']

    return (
      <Fragment>
        <div className='issuance__wrapper'>
          <div className='issuance__header grid-x align-justify'>
            <div onClick={() => history.push('/')} className='issuance__header__logo align-self-middle grid-x align-middle'>
              <Logo isGradientLogo />
            </div>
            <div className='issuance__header__indicators grid-x cell align-center' ref={stepIndicator => (this.stepIndicator = stepIndicator)}>
              <div className='grid-y cell auto'>
                <h4 className='issuance__header__current'>{steps[this.state.activeStep] || steps[this.state.activeStep - 1]}</h4>
                <div className='grid-x align-center'>
                  <StepsIndicator
                    steps={steps}
                    activeStep={this.state.activeStep}
                  />
                </div>
              </div>
            </div>
            <div
              onClick={() => history.push('/')}
              className='issuance__header__close align-self-middle grid-x align-middle align-right'>
              <FontAwesome name='times' />
            </div>
          </div>
          <div className={classNames('issuance__wizard', { 'issuance__wizard--opacity': ((createTokenSignature) || (transactionStatus === FAILURE)) })}>
            {this.state.activeStep < 3 && <h1 className='issuance__wizard__title'>Launch your community</h1>}
            {this.state.activeStep === 3 && <h1 className='issuance__wizard__title'>Review and Sign</h1>}
            {this.state.activeStep === 4 && <h1 className='issuance__wizard__title'>Issuance process</h1>}
            {this.renderStepContent()}
            {
              this.state.activeStep > 0 && ((transactionStatus !== PENDING) && (transactionStatus !== REQUEST)) && (
                <div className='text-center'>
                  <button
                    className='issuance__wizard__back'
                    onClick={this.setPreviousStep}>Back
                  </button>
                </div>
              )
            }
          </div>
        </div>
        <Message
          radiusAll
          issue
          isOpen={createTokenSignature}
          message='Pending'
          isDark
        />

        <Message
          issue
          message={'Oh no'}
          subTitle={`You reject the action, That’s ok, try next time!`}
          isOpen={this.transactionDenied()}
          clickHandler={() => clearTransaction()}
        />

        <Message
          radiusAll
          issue
          isOpen={transactionStatus === FAILURE}
          message='Something went wrong'
          clickHandler={() => clearTransaction()}
          subTitle='Try again later'
        />
      </Fragment>
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
  deployExistingToken,
  clearTransaction,
  loadModal
}

export default connect(mapStateToProps, mapDispatchToProps)(IssuanceWizard)
