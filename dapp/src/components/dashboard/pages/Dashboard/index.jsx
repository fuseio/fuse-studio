import React from 'react'
import { connect, useDispatch } from 'react-redux'
import { QR_MODAL } from 'constants/uiConstants'
import { loadModal } from 'actions/ui'
import { getTransaction } from 'selectors/transaction'
import Bridge from 'components/dashboard/components/Bridge'
import CommunityInfo from 'components/dashboard/components/CommunityInfo'
import FontAwesome from 'react-fontawesome'
import ReactTooltip from 'react-tooltip'
import Header from 'components/dashboard/components/Header'
import ToggleBridgeVersion from 'components/dashboard/components/ToggleBridge'
import { push } from 'connected-react-router'
import { getForeignNetwork } from 'selectors/network'
import { getForeignTokenByCommunityAddress } from 'selectors/token'
import { getEntity, getCommunityAddress } from 'selectors/entities'
import { getTokenAddressOfByNetwork, getCurrentCommunity, getHomeTokenAddress, getIsMultiBridge } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
import get from 'lodash/get'
import { getCoverPhotoUri, getImageUri } from 'utils/metadata'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import CommunityLogo from 'components/common/CommunityLogo'
import SignIn from 'components/common/SignIn'

const CoverPhoto = ({ metadata, symbol }) => {
  return (
    <div className='content__cover_photo'>
      <div className='cover'>
        {
          getCoverPhotoUri(metadata) ? (
            <img alt='cover photo' src={getCoverPhotoUri(metadata)} />
          ) : (
            <img alt='cover photo' src={CommunityPlaceholderImage} />
          )
        }
      </div>
      <div className='logo grid-x align-middle align-center'>
        <CommunityLogo
          isBig
          symbol={symbol}
          imageUrl={getImageUri(metadata)}
          metadata={metadata}
        />
      </div>

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
    homeTokenAddress,
    isMultiBridge,
    tokenOfCommunityOnCurrentSide,
    pathname
  } = props
  const dispatch = useDispatch()

  const communityMetadata = React.useMemo(() => ({
    ...community,
    ...metadata[foreignToken && foreignToken.tokenURI],
    ...metadata[community && community.communityURI]
  }), [metadata, community, foreignToken])

  const loadQrModal = (value) => {
    dispatch(loadModal(QR_MODAL, { value }))
  }

  const handleJoinCommunity = () => {
    dispatch(push(`${pathname}/users/join`))
  }

  return (
    (community && foreignToken) ? <React.Fragment>
      <SignIn accountAddress={accountAddress} />
      {getCoverPhotoUri(communityMetadata) && (
        <CoverPhoto
          symbol={foreignToken && foreignToken.symbol}
          metadata={communityMetadata}
        />
      )}
      <div className='content__wrapper'>
        <Header
          withLogo={!getCoverPhotoUri(communityMetadata)}
          metadata={communityMetadata}
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

export default connect(
  mapStateToProps,
  null
)(Dashboard)
