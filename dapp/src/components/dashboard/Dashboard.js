import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import web3 from 'web3'
import { fetchCommunity, fetchTokenProgress, fetchToken, fetchTokenStatistics, transferToken, mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { isUserExists } from 'actions/user'
import { getClnBalance, getAccountAddress, getBalances } from 'selectors/accounts'
import { formatWei } from 'utils/format'
import { USER_DATA_MODAL, WRONG_NETWORK_MODAL, BRIDGE_MODAL, NO_DATA_ABOUT_OWNER_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { deployBridge } from 'actions/bridge'
import TokenProgress from './TokenProgress'
import TopNav from 'components/TopNav'
import Breadcrumbs from 'components/elements/Breadcrumbs'
import Bridge from './Bridge'
import EntitiesManager from './EntitiesManager'
import { isOwner } from 'utils/token'
import { getTransaction } from 'selectors/transaction'
import DashboardTabs from './DashboardTabs'

const LOAD_USER_DATA_MODAL_TIMEOUT = 2000

class UserDataModal extends React.Component {
  componentDidMount () {
    if (this.props.owner === this.props.accountAddress && !this.props.userExists) {
      this.timerId = setTimeout(this.props.loadUserDataModal, LOAD_USER_DATA_MODAL_TIMEOUT)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.timerId)
  }

  render = () => null
}

UserDataModal.propTypes = {
  owner: PropTypes.string.isRequired,
  accountAddress: PropTypes.string.isRequired,
  loadUserDataModal: PropTypes.func.isRequired,
  userExists: PropTypes.bool
}

class Dashboard extends Component {
  state = {
    transferMessage: false,
    burnMessage: false,
    mintMessage: false,
    lastAction: {}
  }

  handleIntervalChange = (userType, intervalValue) => {
    const { token: { foreignTokenAddress } } = this.props
    if (foreignTokenAddress) {
      const { fetchTokenStatistics } = this.props
      fetchTokenStatistics(foreignTokenAddress, userType, intervalValue)
    }
  }

  componentDidMount () {
    if (!this.props.token) {
      this.props.fetchCommunity(this.props.communityAddress)
      this.props.fetchTokenProgress(this.props.communityAddress)
    }
    if (this.props.networkType !== 'fuse' && this.props.tokenNetworkType !== this.props.networkType) {
      this.props.loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: [this.props.tokenNetworkType], handleClose: this.showHomePage })
    }
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentDidUpdate (prevProps) {
    if (this.props.dashboard.informationAdded && !prevProps.dashboard.informationAdded) {
      this.props.hideModal()
    }
    if (this.props.communityAddress && !prevProps.communityAddress) {
      this.props.fetchCommunity(this.props.communityAddress)
      this.props.fetchTokenProgress(this.props.communityAddress)
    }
    if ((this.props.community && this.props.community.foreignTokenAddress) && !prevProps.community) {
      const { fetchToken, community: { foreignTokenAddress } } = this.props
      fetchToken(foreignTokenAddress)
    }
    if (this.props.accountAddress && !prevProps.accountAddress) {
      const { isUserExists } = this.props
      isUserExists(this.props.accountAddress)
    }
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside = (event) => {
    if (this.content && !this.content.contains(event.target)) {
      this.setState({ dropdownOpen: '' })
    }
  }

  showHomePage = () => {
    this.props.history.push('/')
  }

  loadUserDataModal = () => {
    const { token, loadModal, accountAddress, dashboard: { owner } } = this.props
    const { address: tokenAddress } = token
    if (isOwner({ owner }, accountAddress)) {
      loadModal(USER_DATA_MODAL, { tokenAddress })
    } else {
      loadModal(NO_DATA_ABOUT_OWNER_MODAL, { tokenAddress })
    }
  }

  loadBridgePopup = () => {
    const { loadModal, deployBridge, token, accountAddress, dashboard: { owner } } = this.props
    const { address: tokenAddress } = token
    loadModal(BRIDGE_MODAL, {
      tokenAddress,
      isOwner: isOwner({ owner }, accountAddress),
      buttonAction: deployBridge
    })
  }

  onlyOnFuse = (successFunc) => {
    const { networkType } = this.props
    if (networkType === 'fuse') {
      successFunc()
    } else {
      const { loadModal } = this.props
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: ['fuse'] })
    }
  }

  handleMintOrBurnClick = (actionType, amount) => {
    const { burnToken, mintToken, token: { address: tokenAddress } } = this.props
    if (actionType === 'mint') {
      mintToken(tokenAddress, web3.utils.toWei(String(amount)))
    } else {
      burnToken(tokenAddress, web3.utils.toWei(String(amount)))
    }

    this.setState({ ...this.state, lastAction: { actionType, mintBurnAmount: amount } })
  }

  handleTransper = ({ to: toField, amount }) => {
    const { transferToken, token: { address: tokenAddress } } = this.props
    transferToken(tokenAddress, toField, web3.utils.toWei(String(amount)))
  }

  render () {
    if (!this.props.token) {
      return null
    }
    const {
      lastAction
    } = this.state

    const {
      token,
      accountAddress,
      transactionStatus,
      balances,
      dashboard,
      isTransfer,
      isMinting,
      isBurning,
      networkType,
      tokenNetworkType,
      burnSignature,
      mintSignature,
      transferSignature,
      metadata,
      history,
      match,
      clearTransactionStatus,
      transferSuccess,
      burnSuccess,
      mintSuccess,
      error,
      community
    } = this.props

    const { address: tokenAddress } = token
    const { communityAddress } = community

    const balance = balances[tokenAddress]
    const { admin, user, steps, userExists, owner } = dashboard
    return [
      <TopNav
        key={0}
        active
        history={history}
      />,
      <div key={1} className='dashboard-content'>
        <Breadcrumbs breadCrumbsText={token.name} setToHomepage={this.showHomePage} />
        <div className={`dashboard-container ${networkType}`}>
          <div className='dashboard-section'>
            <TokenProgress
              token={token}
              networkType={tokenNetworkType}
              metadata={metadata}
              steps={steps}
              tokenAddress={tokenAddress}
              tokenNetworkType={tokenNetworkType}
              match={match}
              loadBridgePopup={this.loadBridgePopup}
              loadUserDataModal={this.loadUserDataModal}
            />
            <DashboardTabs
              transferSuccess={transferSuccess}
              burnSuccess={burnSuccess}
              mintSuccess={mintSuccess}
              user={user}
              error={error}
              admin={admin}
              token={token}
              isBurning={isBurning}
              isMinting={isMinting}
              isTransfer={isTransfer}
              lastAction={lastAction}
              networkType={networkType}
              burnSignature={burnSignature}
              mintSignature={mintSignature}
              accountAddress={accountAddress}
              tokenNetworkType={tokenNetworkType}
              transferSignature={transferSignature}
              transactionStatus={transactionStatus}
              handleTransper={this.handleTransper}
              handleIntervalChange={this.handleIntervalChange}
              handleMintOrBurnClick={this.handleMintOrBurnClick}
              balance={balance ? formatWei(balance, 0) : 0}
              clearTransactionStatus={clearTransactionStatus}
            />
          </div>
          <Bridge
            bridgeDeployed={steps && steps.bridge}
            accountAddress={accountAddress}
            token={token}
            foreignTokenAddress={tokenAddress}
            isOwner={() => isOwner({ owner }, accountAddress)}
            loadBridgePopup={this.loadBridgePopup}
            handleTransfer={this.handleTransfer}
            communityAddress={communityAddress}
            network={networkType}
          />
          <EntitiesManager
            {...dashboard}
            community={community}
            history={history}
            token={token}
            onlyOnFuse={this.onlyOnFuse}
          />
        </div>
        {
          token && accountAddress && dashboard.hasOwnProperty('userExists') &&
          <UserDataModal
            owner={owner}
            accountAddress={accountAddress}
            userExists={userExists}
            loadUserDataModal={this.loadUserDataModal}
          />
        }
      </div>
    ]
  }
}

const mapStateToProps = (state, { match }) => ({
  ...state.screens.token,
  networkType: state.network.networkType,
  token: state.entities.communities &&
    state.entities.tokens &&
    state.entities.communities[match.params.address] &&
    state.entities.communities[match.params.address].foreignTokenAddress &&
    state.entities.tokens[state.entities.communities[match.params.address].foreignTokenAddress],
  community: state.entities.communities && state.entities.communities[match.params.address],
  communityAddress: match.params.address,
  tokenNetworkType: match.params.networkType,
  metadata: state.entities.metadata,
  dashboard: state.screens.dashboard,
  accountAddress: getAccountAddress(state),
  clnBalance: getClnBalance(state),
  balances: getBalances(state),
  ...getTransaction(state, state.screens.token.transactionHash),
  homeTokenAddress: state.entities.bridges[match.params.address] && state.entities.bridges[match.params.address].homeTokenAddress
})

const mapDispatchToProps = {
  fetchTokenStatistics,
  fetchCommunity,
  fetchToken,
  fetchTokenProgress,
  isUserExists,
  loadModal,
  hideModal,
  deployBridge,
  transferToken,
  mintToken,
  burnToken,
  clearTransactionStatus
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
