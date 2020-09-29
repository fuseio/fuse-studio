import React from 'react'
import { isMobileOnly } from 'react-device-detect'
import CommunityLogo from 'components/common/CommunityLogo'
import PlusIcon from 'images/plus.svg'

import { getImageUri } from 'utils/metadata'

export default ({ isClosed, token, metadata, name, handleJoinCommunity }) => {
  return (
    <div className='community_header'>
      <div className='community_header__image'>
        <CommunityLogo
          symbol={token && token.symbol}
          imageUrl={getImageUri(metadata)}
          isSmall={isMobileOnly}
          metadata={metadata}
        />
      </div>
      <div className='community_header__content'>
        <div className='name__wrapper'>
          <h2 className='name'>{name}</h2>
          &nbsp;&nbsp;<span className='name__line' />&nbsp;&nbsp;
          <span className='name__status'>{isClosed ? 'Close' : 'Open'} community</span>
        </div>
      </div>
      {
        handleJoinCommunity
          ? <div className='community_header__button'>
            <button onClick={handleJoinCommunity}><img src={PlusIcon} />Join community</button>
          </div>
          : null
      }
    </div>
  )
}
