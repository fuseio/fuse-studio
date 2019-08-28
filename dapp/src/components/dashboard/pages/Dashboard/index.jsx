import React, { Component } from 'react'
import { toWei } from 'web3-utils'
import { connect } from 'react-redux'
import { fetchTokenStatistics, transferToken, mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { getBalances } from 'selectors/accounts'
import { USER_DATA_MODAL, WRONG_NETWORK_MODAL, BRIDGE_MODAL, NO_DATA_ABOUT_OWNER_MODAL, QR_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { deployBridge } from 'actions/bridge'
import { isUserExists } from 'actions/user'
import { getTransaction } from 'selectors/transaction'
import { isOwner } from 'utils/token'
import Bridge from 'components/dashboard/components/Bridge'
import { getBridgeStatus } from 'selectors/network'
import CommunityInfo from 'components/dashboard/components/CommunityInfo'

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
    window.addEventListener('mousedown', this.handleClickOutside)
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
      mintToken(tokenAddress, toWei(String(amount)))
    } else {
      burnToken(tokenAddress, toWei(String(amount)))
    }

    this.setState({ ...this.state, lastAction: { actionType, mintBurnAmount: amount } })
  }

  handleTransfer = ({ to: toField, amount }) => {
    const { transferToken, token: { address: tokenAddress } } = this.props
    transferToken(tokenAddress, toField, toWei(String(amount)))
  }

  handleIntervalChange = (userType, intervalValue) => {
    const { community: { foreignTokenAddress } } = this.props
    if (foreignTokenAddress) {
      const { fetchTokenStatistics } = this.props
      fetchTokenStatistics(foreignTokenAddress, userType, intervalValue)
    }
  }

  loadQrModal = (value) => {
    const { loadModal } = this.props
    loadModal(QR_MODAL, { value })
  }

  render () {
    const {
      community,
      token,
      accountAddress,
      balances,
      dashboard,
      networkType
    } = this.props

    const { address: tokenAddress } = token
    const { communityAddress, homeTokenAddress, foreignTokenAddress } = community
    const { steps, owner } = dashboard

    return (
      <React.Fragment>
        <div className='content__tabs'>
          <CommunityInfo
            token={token}
            balances={balances}
            loadQrModal={this.loadQrModal}
            communityAddress={communityAddress}
            homeTokenAddress={homeTokenAddress}
            foreignTokenAddress={foreignTokenAddress}
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
