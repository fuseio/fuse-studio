import React from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import CommunityInfo from 'components/FuseDashboard/components/CommunityInfo'
import Header from 'components/FuseDashboard/components/Header'
import { push } from 'connected-react-router'
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
  const communityURI = dashboard?.community?.communityURI
  const communityMetadata = useSelector(state => state.entities.metadata[communityURI])

  const handleJoinCommunity = () => {
    dispatch(push(`${pathname}/users/join`))
  }

  return (
    <div className='content__wrapper'>
      <Header
        withLogo
        metadata={communityMetadata}
        handleJoinCommunity={handleJoinCommunity}
      />
      <CommunityInfo />
    </div>
  )
}

export default withRouter(observer(Dashboard))
