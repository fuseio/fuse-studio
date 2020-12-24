import React from 'react'
import CommunityInfo from 'components/FuseDashboard/components/CommunityInfo'
import Header from 'components/FuseDashboard/components/Header'
import { observer } from 'mobx-react'

const Dashboard = (props) => {
  return (
    <div className='content__wrapper'>
      <Header withLogo />
      <CommunityInfo />
    </div>
  )
}

export default observer(Dashboard)
