import React from 'react'
import Bridge from 'components/FuseDashboard/components/Bridge'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

function BridgePage (props) {
  const { dashboard, network } = useStore()
  const { accountAddress } = network
  const homeTokenAddress = dashboard?.community?.homeTokenAddress
  const foreignTokenAddress = dashboard?.community?.foreignTokenAddress

  const handleConfirmation = () => {
    dashboard.checkAllowance(accountAddress)
    dashboard.fetchTokensTotalSupply()
    dashboard.fetchTokenBalances(accountAddress)
    dashboard.fetchHomeToken(homeTokenAddress)
    dashboard.fetchForeignToken(foreignTokenAddress)
  }

  return (
    <>
      <div className='qr-code__header'>
        <h2 className='qr-code__header__title'>Bridge</h2>
      </div>
      <div className='qr-code__wrapper'>
        <Bridge withTitle={false} onConfirmation={handleConfirmation} />
      </div>
    </>
  )
}

export default observer(BridgePage)
