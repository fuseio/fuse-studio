import React from 'react'
import CommunityInfo from 'components/FuseDashboard/components/CommunityInfo'
import Bridge from 'components/FuseDashboard/components/Bridge'
import Header from 'components/FuseDashboard/components/Header'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

const Dashboard = (props) => {
  const { dashboard } = useStore()

  const handleConfirmation = () => {
    dashboard.fetchTokensTotalSupply()
    dashboard.fetchTokenBalances(accountAddress)
    dashboard.checkAllowance(accountAddress)
  }

  return (
    <div className='content__wrapper'>
      <Header withLogo />
      <CommunityInfo />
      {
        (dashboard?.community?.bridgeDirection === 'foreign-to-home') && (
          <Bridge
            onConfirmation={handleConfirmation}
          />
        )
      }
    </div>
  )
}

export default observer(Dashboard)
