import React, { Component } from 'react'
import { toWei } from 'web3-utils'
import { connect } from 'react-redux'
import { transferToken, mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { WRONG_NETWORK_MODAL, QR_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { getTransaction } from 'selectors/transaction'
import Bridge from 'components/dashboard/components/Bridge'
import CommunityInfo from 'components/dashboard/components/CommunityInfo'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import Header from 'components/dashboard/components/Header'
import { push } from 'connected-react-router'
import { getForeignNetwork } from 'selectors/network'
import SignIn from 'components/common/SignIn'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { checkIsAdmin, getCommunityAddress } from 'selectors/entities'
import { getTokenAddressOfByNetwork, getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'

class Dashboard extends Component {
  state = {
    transferMessage: false,
    burnMessage: false,
    mintMessage: false,
    lastAction: {}
  }

  componentDidUpdate (prevProps) {
    const { networkType, tokenNetworkType } = this.props
    if ((!prevProps.tokenNetworkType && (prevProps.tokenNetworkType !== networkType)) && (networkType !== 'fuse')) {
      const { loadModal } = this.props
      loadModal(WRONG_NETWORK_MODAL, { supportedNetworks: [tokenNetworkType], handleClose: this.showHomePage })
    }
  }

  showHomePage = () => {
    this.props.push('/')
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

  loadQrModal = (value) => {
    const { loadModal } = this.props
    loadModal(QR_MODAL, { value })
  }

  getHeaderMetadata = () => {
    const {
      community,
      foreignToken,
      metadata
    } = this.props
    if (community && community.communityURI && metadata) {
      return {
        ...metadata[foreignToken.tokenURI],
        ...metadata[community.communityURI]
      }
    } else if (foreignToken && foreignToken.tokenURI && (metadata && metadata[foreignToken.tokenURI])) {
      return {
        ...metadata[foreignToken.tokenURI]
      }
    } else {
      return {}
    }
  }

  render () {
    const {
      community,
      foreignToken,
      accountAddress,
      dashboard,
      metadata,
      networkType,
      tokenOfCommunityOnCurrentSide,
      isAdmin
    } = this.props

    return (
      (community && foreignToken) ? <React.Fragment>
        <SignIn accountAddress={accountAddress} />
        <Header
          metadata={{
            ...metadata[foreignToken && foreignToken.tokenURI],
            ...metadata[community && community.communityURI]
          }}
          tokenAddress={foreignToken && foreignToken.tokenAddress}
          isClosed={community && community.isClosed}
          communityURI={community && community.communityURI}
          name={community && community.name}
          networkType={networkType}
          token={foreignToken}
        />
        <CommunityInfo
          tokensTotalSupplies={dashboard && dashboard.totalSupply}
          foreignToken={foreignToken}
          loadQrModal={this.loadQrModal}
          communityAddress={community && community.communityAddress}
          homeTokenAddress={community && community.homeTokenAddress}
          foreignTokenAddress={community && community.foreignTokenAddress}
        />
        {
          (community && community.homeBridgeAddress) && (community && community.foreignBridgeAddress) && (
            <div className='content__bridge'>
              <h3 className='content__bridge__title'>Bridge <FontAwesome style={{ fontSize: '60%' }} data-tip data-for='bridge' name='info-circle' /></h3>
              <ReactTooltip className='tooltip__content' id='bridge' place='bottom' effect='solid'>
                <div>Use the bridge to move tokens to Fuse to add new functionality and faster and cheaper verification times. You can start by selecting an initial sum, sigining the transaction and wait for 2 confirmations. Then you can switch to the Fuse chain to see the coins on the other side. Click here to learn more about the bridge.</div>
              </ReactTooltip>
              <Bridge
                symbol={foreignToken && foreignToken.symbol}
                tokenName={community.name}
                isAdmin={isAdmin}
                community={community}
                accountAddress={accountAddress}
                communityAddress={community && community.communityAddress}
                tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
              />
            </div>
          )
        }
      </React.Fragment> : <div />
    )
  }
}

const mapStateToProps = (state) => ({
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  isAdmin: checkIsAdmin(state),
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, getCurrentCommunity(state, getCommunityAddress(state))),
  accountAddress: getAccountAddress(state),
  community: getCurrentCommunity(state, getCommunityAddress(state)),
  foreignToken: getForeignTokenByCommunityAddress(state, getCommunityAddress(state)),
  dashboard: state.screens.dashboard,
  ...state.screens.token,
  ...getTransaction(state, state.screens.token.transactionHash)
})

const mapDispatchToProps = {
  loadModal,
  hideModal,
  transferToken,
  mintToken,
  burnToken,
  clearTransactionStatus,
  push
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
