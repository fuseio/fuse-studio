import React, { useEffect, memo } from 'react'
import { connect } from 'react-redux'
import ArrowTiny from 'images/arrow_tiny.svg'

import { fetchToken } from 'actions/token'
import { fetchMetadata } from 'actions/metadata'
import { balanceOfToken } from 'actions/accounts'
import { getImageUri } from 'utils/metadata'

import CommunityLogo from 'components/common/CommunityLogo'

const ProfileCard = memo(({
  community,
  metadata,
  balance,
  fetchMetadata,
  fetchToken,
  balanceOfToken,
  showDashboard,
  accountAddress
}) => {
  const { token } = community
  const { name, symbol, tokenURI } = token
  const { communityURI, homeTokenAddress, foreignTokenAddress, communityAddress } = community

  useEffect(() => {
    if (accountAddress) {
      balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
      balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
    }

    fetchMetadata(communityURI)
    fetchMetadata(tokenURI)
    fetchToken(homeTokenAddress)
    fetchToken(foreignTokenAddress)
    return () => { }
  }, [])

  return (
    <div className='profile__card grid-x cell align-middle' onClick={() => showDashboard(communityAddress)}>
      <div className='profile__card__logo'>
        <CommunityLogo
          symbol={symbol}
          imageUrl={getImageUri(metadata)}
          isSmall
          metadata={metadata}
        />
      </div>
      <div className='cell auto grid-y profile__card__content'>
        <h5 className='profile__card__title'>{name}</h5>
        <p className='profile__card__balance'>
          <span>Balance:&nbsp;</span>
          <span>{balance}&nbsp;</span>
          <span>{symbol}</span>
        </p>
      </div>
      <div className='profile__card__arrow'>
        <img src={ArrowTiny} />
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.entity !== nextProps.entity) {
    return false
  }
  if (prevProps.metadata !== nextProps.metadata) {
    return false
  }
  if (prevProps.balance !== nextProps.balance) {
    return false
  }
  if (prevProps.balance !== nextProps.balance) {
    return false
  }
  if (prevProps.accountAddress !== nextProps.accountAddress) {
    return false
  }
  return true
})

export default connect(null, {
  fetchMetadata,
  fetchToken,
  balanceOfToken
})(ProfileCard)
