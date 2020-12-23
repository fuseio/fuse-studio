import React, { memo } from 'react'
import ArrowTiny from 'images/arrow_tiny.svg'

import { getImageUri } from 'utils/metadata'

import CommunityLogo from 'components/common/CommunityLogo'

const ProfileCard = memo(({
  community,
  metadata,
  balance,
  showDashboard
}) => {
  const { token, communityAddress } = community
  const { name, symbol } = token
  return (
    <div className='profile__card profile__card--link grid-x cell align-middle' onClick={() => showDashboard(communityAddress, name, token)}>
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

export default ProfileCard
