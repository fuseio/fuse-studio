import React from 'react'
import { useParams } from 'react-router'
import { connect, useSelector } from 'react-redux'
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
import { getTokenAddressOfByNetwork, getCurrentCommunity, getHomeTokenAddress, getIsMultiBridge } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
import get from 'lodash/get'
import { getCoverPhotoUri, getImageUri } from 'utils/metadata'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import CommunityLogo from 'components/common/CommunityLogo'

const CoverPhoto = ({ community, metadata, symbol }) => {
  console.log(metadata)
  return (
    <div className='content__cover_photo'>
      <div className='cover'>
        <img src={'https://fuse-studio-qa.s3.eu-central-1.amazonaws.com/03b66e0d92a1d80cc3af21d981864d38929e6a468c9935eaa2394b0ad552aaf4'} />
      </div>
      <div className='logo__wrapper'>
        <div className='logo'>
          <CommunityLogo
            symbol={symbol}
            imageUrl={getImageUri(metadata)}
            metadata={metadata}
          />
        </div>
      </div>
      {/* <img src={
        getCoverPhotoUri(community) ? (
          <img alt='cover photo' src={getCoverPhotoUri(community)} />
        ) : getCoverPhotoUri(metadata) ? (
          <img alt='cover photo' src={getCoverPhotoUri(metadata)} />
        ) : (
              <img alt='cover photo' src={CommunityPlaceholderImage} />
            )
      } /> */}
    </div>
  )
}

const Dashboard = (props) => {
  const {
    community,
    foreignToken,
    accountAddress,
    dashboard,
    metadata,
    networkType,
    userEntity,
    push,
    loadModal,
    homeTokenAddress,
    isMultiBridge,
    tokenOfCommunityOnCurrentSide
  } = props
  const { address: communityAddress } = useParams()

  const loadQrModal = (value) => {
    loadModal(QR_MODAL, { value })
  }

  const handleJoinCommunity = () => {
    push(`${this.props.pathname}/users`)
    joinCommunity(communityAddress)
  }

  return (
    (community && foreignToken) ? <React.Fragment>
      <CoverPhoto
        community={community}
        symbol={foreignToken && foreignToken.symbol}
        metadata={{
          ...metadata[foreignToken && foreignToken.tokenURI],
          ...metadata[community && community.communityURI]
        }}
      />
      <div className='content__wrapper'>
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
                {!get(community, 'isMultiBridge', false) && <ToggleBridgeVersion isUseMultiBridge={get(community, 'isMultiBridge', false)} />}
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
      </div>
    </React.Fragment> : <div />
  )
}

const mapStateToProps = (state) => ({
  tokenNetworkType: getForeignNetwork(state),
  homeTokenAddress: getHomeTokenAddress(state, getCurrentCommunity(state)),
  isMultiBridge: getIsMultiBridge(state),
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
