import React, { useEffect } from 'react'
import { formatWei } from 'utils/format'
import { connect } from 'react-redux'
import { getAccount } from 'selectors/accounts'
import MainnetLogo from 'images/Mainnet.svg'
import FuseLogo from 'images/fuseLogo.svg'

const NativeBalance = ({
  account,
  isMetaMask,
  isPortis
}) => {
  useEffect(() => {
    const { analytics } = window
    if (account && account.accountAddress) {
      analytics.identify(account.accountAddress,
        isPortis ? {
          subscriptionStatus: 'active',
          provider: 'Portis'
        } : isMetaMask ? {
          provider: 'Metamask'
        } : null)
    } else {
      analytics.identify({
        subscriptionStatus: 'inactive'
      })
    }
  }, [account])

  return (
    <div className='profile__communities grid-y'>
      <span>My balance</span>
      <div className='profile__card grid-x cell align-middle'>
        <div className='profile__card__logo'>
          <img src={MainnetLogo} />
        </div>
        <div className='cell auto grid-y profile__card__content'>
          <h5 className='profile__card__title'>Ethereum Network</h5>
          <p className='profile__card__balance'>
            <span>Balance:&nbsp;</span>
            <span>{account && account.foreign ? formatWei((account.foreign), 2) : 0}&nbsp;</span>
            <span>ETH</span>
          </p>
        </div>
      </div>
      <div className='profile__card grid-x cell align-middle'>
        <div className='profile__card__logo'>
          <img src={FuseLogo} />
        </div>
        <div className='cell auto grid-y profile__card__content'>
          <h5 className='profile__card__title'>Fuse Network</h5>
          <p className='profile__card__balance'>
            <span>Balance:&nbsp;</span>
            <span>{account && account.home ? formatWei((account && account.home), 2) : 0}&nbsp;</span>
            <span>FUSE</span>
          </p>
        </div>
      </div>
    </div>
  )
}

const mapState = (state) => ({
  account: getAccount(state)
})

export default connect(mapState, null)(NativeBalance)
