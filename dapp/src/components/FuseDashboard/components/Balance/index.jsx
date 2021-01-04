import React, { memo } from 'react'
import { convertNetworkName } from 'utils/network'
import MainnetLogo from 'images/Mainnet.svg'
import FuseLogo from 'images/fuse_network_logo.svg'
import { formatWei } from 'utils/format'
import { observer } from 'mobx-react'
import { useStore } from 'store/mobx'

const NetworkLogo = observer(({ side }) => {
  const { dashboard } = useStore()
  const { network } = dashboard?.bridgeStatus[side]
  if (network === 'fuse') {
    return <div className='network-logo'><img src={FuseLogo} /></div>
  }

  return <div className='network-logo'><img src={MainnetLogo} /></div>
})

const Balance = ({
  openModal,
  side
}) => {
  const { dashboard } = useStore()
  const { bridge, network } = dashboard?.bridgeStatus[side]
  const balance = dashboard?.tokenBalances[bridge]
  return (
    <div className='bridge'>
      <NetworkLogo side={side} />
      <div className='grid-y align-top'>
        <div className='bridge__title cell'>{convertNetworkName(network)}</div>
        <div className='bridge__text cell'>
          Balance&nbsp;{balance ? formatWei(balance, 2, dashboard?.homeToken?.decimals) : 0} {dashboard?.homeToken?.symbol}
        </div>
      </div>
      <button className='bridge__more' onClick={openModal}>Show more</button>
    </div>
  )
}

export default observer(Balance)
