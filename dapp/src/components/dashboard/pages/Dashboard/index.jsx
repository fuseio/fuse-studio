import React, { useState } from 'react'
import { useParams } from 'react-router'
import { connect } from 'react-redux'
import { joinCommunity } from 'actions/communityEntities'
import { QR_MODAL } from 'constants/uiConstants'
import { loadModal, hideModal } from 'actions/ui'
import { getTransaction } from 'selectors/transaction'
import Bridge from 'components/dashboard/components/Bridge'
import CommunityInfo from 'components/dashboard/components/CommunityInfo'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import Header from 'components/dashboard/components/Header'
import ToggleBridgeVersion from 'components/dashboard/components/ToggleBridge'
import { push } from 'connected-react-router'
import { getForeignNetwork } from 'selectors/network'
import SignIn from 'components/common/SignIn'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getEntity, getCommunityAddress } from 'selectors/entities'
import { getTokenAddressOfByNetwork, getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
import get from 'lodash/get'

const Dashboard = (props) => {
  const {
    community,
    foreignToken,
    accountAddress,
    dashboard,
    metadata,
    networkType,
    tokenOfCommunityOnCurrentSide,
    userEntity,
    push,
    loadModal
  } = props
  const [isMultiBridge, setIsMultiBridge] = useState(get(community, 'isMultiBridge', false))
  const { address: communityAddress } = useParams()
  const homeTokenAddress = isMultiBridge ? (dashboard && dashboard.homeTokenAddress) : (community && community.homeTokenAddress)

  const loadQrModal = (value) => {
    loadModal(QR_MODAL, { value })
  }

  const handleJoinCommunity = () => {
    push(`${this.props.pathname}/users`)
    joinCommunity(communityAddress)
  }

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
        handleJoinCommunity={userEntity ? undefined : handleJoinCommunity}
      />
      <CommunityInfo
        tokensTotalSupplies={dashboard && dashboard.totalSupply}
        foreignToken={foreignToken}
        loadQrModal={loadQrModal}
        communityAddress={community && community.communityAddress}
        homeTokenAddress={homeTokenAddress}
        foreignTokenAddress={community && community.foreignTokenAddress}
      />
      {
        (community && community.foreignTokenAddress) && (
          <div className='content__bridge'>
            <div className='grid-x align-justify'>
              <h3 className='content__bridge__title'>Bridge <FontAwesome style={{ fontSize: '60%' }} data-tip data-for='bridge' name='info-circle' /></h3>
              <ReactTooltip className='tooltip__content' id='bridge' place='bottom' effect='solid'>
                <div>Use the bridge to move tokens to Fuse to add new functionality and faster and cheaper verification times. You can start by selecting an initial sum, sigining the transaction and wait for 2 confirmations. Then you can switch to the Fuse chain to see the coins on the other side. Click here to learn more about the bridge.</div>
              </ReactTooltip>
              {!get(community, 'isMultiBridge', false) && <ToggleBridgeVersion isUseMultiBridge={isMultiBridge} submitHandler={(values) => setIsMultiBridge(values.isUseMultiBridge)} />}
            </div>
            <Bridge
              symbol={foreignToken && foreignToken.symbol}
              decimals={foreignToken && foreignToken.decimals}
              isMultiBridge={isMultiBridge}
              tokenName={community.name}
              isAdmin={userEntity && userEntity.isAdmin}
              homeTokenAddress={homeTokenAddress}
              foreignTokenAddress={community && community.foreignTokenAddress}
              community={{ ...community, homeTokenAddress }}
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

const mapStateToProps = (state) => ({
  tokenNetworkType: getForeignNetwork(state),
  metadata: state.entities.metadata,
  userEntity: getEntity(state),
  tokenOfCommunityOnCurrentSide: getTokenAddressOfByNetwork(state, getCurrentCommunity(state)),
  accountAddress: getAccountAddress(state),
  foreignToken: getForeignTokenByCommunityAddress(state, getCommunityAddress(state)),
  dashboard: state.screens.dashboard,
  hasHomeTokenInNewBridge: get(state, 'screens.dashboard.hasHomeTokenInNewBridge', false),
  community: getCurrentCommunity(state),
  ...state.screens.token,
  ...getTransaction(state, state.screens.token.transactionHash),
  pathname: state.router.location.pathname
})

const mapDispatchToProps = {
  loadModal,
  hideModal,
  push,
  joinCommunity
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
