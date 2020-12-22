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
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'
import { withRouter } from 'react-router'

const Dashboard = (props) => {
  const {
    // metadata,
    userEntity,
    pathname
  } = props
  const dispatch = useDispatch()
  const { dashboard } = useStore()

  console.log({ Dashboard: dashboard?.community })
  // const communityMetadata = React.useMemo(() => ({
  //   ...community,
  //   ...metadata[community && community.communityURI]
  // }), [metadata, community])

  // const handleJoinCommunity = () => {
  //   dispatch(push(`${pathname}/users/join`))
  // }

  return (
    <>
      <div className='content__wrapper'>
        <Header
          withLogo
        // metadata={communityMetadata}
        // isClosed={community && community.isClosed}
        // communityURI={community && community.communityURI}
        // name={community && community.name}
        // symbol={dashboard?.homeToken?.symbol}
        // handleJoinCommunity={userEntity ? undefined : handleJoinCommunity}
        />
        <CommunityInfo />
      </div>
    </>
  )
}

export default withRouter(observer(Dashboard))
