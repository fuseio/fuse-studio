import React, { Component } from 'react'
import { toWei } from 'web3-utils'
import { connect } from 'react-redux'
import { transferToken, mintToken, burnToken, clearTransactionStatus } from 'actions/token'
import { WRONG_NETWORK_MODAL, QR_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { deployBridge } from 'actions/bridge'
import { getTransaction } from 'selectors/transaction'
import Bridge from 'components/dashboard/components/Bridge'
import CommunityInfo from 'components/dashboard/components/CommunityInfo'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import Header from 'components/dashboard/components/Header'

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
  }

  showHomePage = () => {
    this.props.history.push('/')
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
      bridgeStatus,
      metadata,
      networkType,
      tokenOfCommunityOnCurrentSide,
      isAdmin
    } = this.props

    const { communityAddress, homeTokenAddress, foreignTokenAddress, homeBridgeAddress, foreignBridgeAddress, isClosed } = community
    const { totalSupply } = dashboard

    console.log({ communityURI: community && community.communityURI && metadata[community.communityURI] })
    console.log({ tokenURI: metadata[foreignToken.tokenURI] })

    const { symbol, tokenAddress } = foreignToken
    return (
      <React.Fragment>
        <Header
          metadata={this.getHeaderMetadata()}
          tokenAddress={tokenAddress}
          isClosed={isClosed}
          communityURI={community.communityURI}
          name={community.name}
          networkType={networkType}
          token={foreignToken}
        />
        <div className='content__tabs'>
          <CommunityInfo
            tokensTotalSupplies={totalSupply}
            foreignToken={foreignToken}
            loadQrModal={this.loadQrModal}
            communityAddress={communityAddress}
            homeTokenAddress={homeTokenAddress}
            foreignTokenAddress={foreignTokenAddress}
          />
        </div>
        {
          homeBridgeAddress && foreignBridgeAddress && (
            <div className='content__bridge'>
              <h3 className='content__bridge__title'>Bridge <FontAwesome style={{ fontSize: '60%' }} data-tip data-for='bridge' name='info-circle' /></h3>
              <ReactTooltip className='tooltip__content' id='bridge' place='bottom' effect='solid'>
                <div>Use the bridge to move tokens to Fuse to add new functionality and faster and cheaper verification times. You can start by selecting an initial sum, sigining the transaction and wait for 2 confirmations. Then you can switch to the Fuse chain to see the coins on the other side. Click here to learn more about the bridge.</div>
              </ReactTooltip>
              <Bridge
                symbol={symbol}
                tokenName={community.name}
                isAdmin={isAdmin}
                community={community}
                bridgeStatus={bridgeStatus}
                accountAddress={accountAddress}
                communityAddress={communityAddress}
                tokenOfCommunityOnCurrentSide={tokenOfCommunityOnCurrentSide}
              />
            </div>
          )
        }
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state.screens.token,
  ...getTransaction(state, state.screens.token.transactionHash)
})

const mapDispatchToProps = {
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
