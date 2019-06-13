import React, { Component } from 'react'
import web3 from 'web3'
import { connect } from 'react-redux'
import { fetchTokenStatistics, transferToken, mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { getClnBalance, getBalances } from 'selectors/accounts'
import { USER_DATA_MODAL, WRONG_NETWORK_MODAL, BRIDGE_MODAL, NO_DATA_ABOUT_OWNER_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { deployBridge } from 'actions/bridge'
import { isUserExists } from 'actions/user'
import { formatWei } from 'utils/format'
import { getTransaction } from 'selectors/transaction'
import { isOwner } from 'utils/token'
import DashboardTabs from '../../components/DashboardTabs'
import Bridge from '../../components/Bridge'
import { getBridgeStatus } from 'selectors/network'
import { BigNumber } from 'bignumber.js'

class Dashboard extends Component {
  state = {
    transferMessage: false,
    burnMessage: false,
    mintMessage: false,
    lastAction: {}
  }

  componentDidMount () {
    if (this.props.networkType !== 'fuse' && this.props.tokenNetworkType !== this.props.networkType) {
      this.props.loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: [this.props.tokenNetworkType], handleClose: this.showHomePage })
    }
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this.handleClickOutside)
  }

  componentDidUpdate (prevProps) {
    if (this.props.dashboard.informationAdded && !prevProps.dashboard.informationAdded) {
      this.props.hideModal()
    }
    if (this.props.accountAddress && !prevProps.accountAddress) {
      const { isUserExists } = this.props
      isUserExists(this.props.accountAddress)
    }
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

  handleMintOrBurnClick = (actionType, amount) => {
    const { burnToken, mintToken, token: { address: tokenAddress } } = this.props
    if (actionType === 'mint') {
      mintToken(tokenAddress, web3.utils.toWei(String(amount)))
    } else {
      burnToken(tokenAddress, web3.utils.toWei(String(amount)))
    }

    this.setState({ ...this.state, lastAction: { actionType, mintBurnAmount: amount } })
  }

  handleTransfer = ({ to: toField, amount }) => {
    const { transferToken, token: { address: tokenAddress } } = this.props
    transferToken(tokenAddress, toField, web3.utils.toWei(String(amount)))
  }

  handleIntervalChange = (userType, intervalValue) => {
    const { token: { foreignTokenAddress } } = this.props
    if (foreignTokenAddress) {
      const { fetchTokenStatistics } = this.props
      fetchTokenStatistics(foreignTokenAddress, userType, intervalValue)
    }
  }

  render () {
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
      clearTransactionStatus,
      transferSuccess,
      burnSuccess,
      mintSuccess,
      error,
      community,
      bridgeStatus,
      homeNetwork
    } = this.props

    const { address: tokenAddress } = token
    const { communityAddress, homeTokenAddress, foreignTokenAddress } = community
    const balance = balances[tokenAddress]
    const { admin, user, steps, owner } = dashboard

    return (
      <React.Fragment>
        <div className='content__tabs'>
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
            balanceOnEthereum={new BigNumber(balances[homeNetwork === bridgeStatus['from'].network ? homeTokenAddress : foreignTokenAddress]).div(1e18).toFormat(2, 1)}
            mintSignature={mintSignature}
            accountAddress={accountAddress}
            tokenNetworkType={tokenNetworkType}
            transferSignature={transferSignature}
            transactionStatus={transactionStatus}
            handleTransfer={this.handleTransfer}
            handleIntervalChange={this.handleIntervalChange}
            handleMintOrBurnClick={this.handleMintOrBurnClick}
            balance={balance ? formatWei(balance, 0) : 0}
            clearTransactionStatus={clearTransactionStatus}
          />
        </div>

        <div className='content__bridge'>
          <h3 className='content__bridge__title'>Bridge</h3>
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
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state.screens.token,
  clnBalance: getClnBalance(state),
  balances: getBalances(state),
  ...getTransaction(state, state.screens.token.transactionHash),
  bridgeStatus: getBridgeStatus(state),
  homeNetwork: state.network.homeNetwork
})

const mapDispatchToProps = {
  fetchTokenStatistics,
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
