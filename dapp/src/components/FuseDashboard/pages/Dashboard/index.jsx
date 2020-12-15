import React from 'react'
import { connect, useDispatch } from 'react-redux'
import CommunityInfo from 'components/FuseDashboard/components/CommunityInfo'
import Header from 'components/FuseDashboard/components/Header'
import { push } from 'connected-react-router'
import { getHomeTokenByCommunityAddress } from 'selectors/token'
import { getEntity, getCommunityAddress } from 'selectors/entities'
import { getCurrentCommunity } from 'selectors/dashboard'
import { getAccountAddress } from 'selectors/accounts'
import get from 'lodash/get'

const Dashboard = (props) => {
  const {
    community,
    homeToken,
    metadata,
    userEntity,
    pathname
  } = props
  const dispatch = useDispatch()

  const communityMetadata = React.useMemo(() => ({
    ...community,
    ...metadata[community && community.communityURI]
  }), [metadata, community])

  const handleJoinCommunity = () => {
    dispatch(push(`${pathname}/users/join`))
  }

  return (
    (community) ? <React.Fragment>
      <div className='content__wrapper'>
        <Header
          withLogo
          metadata={communityMetadata}
          isClosed={community && community.isClosed}
          communityURI={community && community.communityURI}
          name={community && community.name}
          symbol={homeToken && homeToken.symbol}
          handleJoinCommunity={userEntity ? undefined : handleJoinCommunity}
        />
        <CommunityInfo
          communityAddress={community && community.communityAddress}
          homeTokenAddress={community && community.homeTokenAddress}
          tokenType={homeToken && homeToken.tokenType}
          symbol={homeToken && homeToken.symbol}
          decimals={homeToken && homeToken.decimals}
          homeToken={homeToken}
        />
      </div>
    </React.Fragment> : <div />
  )
}

const mapStateToProps = (state) => ({
  metadata: state.entities.metadata,
  userEntity: getEntity(state),
  accountAddress: getAccountAddress(state),
  homeToken: getHomeTokenByCommunityAddress(state, getCommunityAddress(state)),
  hasHomeTokenInNewBridge: get(state, 'screens.dashboard.hasHomeTokenInNewBridge', false),
  community: getCurrentCommunity(state),
  pathname: state.router.location.pathname
})

export default connect(
  mapStateToProps,
  null
)(Dashboard)
