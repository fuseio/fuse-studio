import React, { memo } from 'react'
import { convertNetworkName } from 'utils/network'
import MainnetLogo from 'images/Mainnet.svg'
import FuseLogo from 'images/fuseLogo.svg'
import { formatWei } from 'utils/format'

const NetworkLogo = memo(({ network }) => {
  if (network === 'fuse') {
    return <div className='network-logo'><img src={FuseLogo} /></div>
  }

  return <div className='network-logo'><img src={MainnetLogo} /></div>
}, (prevProps, nextProps) => {
  if (prevProps.network !== nextProps.network) {
    return false
  }

  return true
})

const Balance = ({
  bridgeSide,
  symbol,
  openModal,
  balance
}) => {
  const { network } = bridgeSide

  return (
    <div className='bridge'>
      <NetworkLogo network={network} />
      <div className='bridge__title'>{convertNetworkName(network)}</div>
      <div className='bridge__text'>
        <div>Balance</div>
        <span>{balance ? formatWei(balance, 2) : 0} <small>{symbol}</small>
        </span>
      </div>
      <button className='bridge__more' onClick={openModal}>Show more</button>
    </div>
  )
}

export default Balance
