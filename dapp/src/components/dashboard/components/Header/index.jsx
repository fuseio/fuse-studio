import React from 'react'
import { isMobileOnly } from 'react-device-detect'
import CommunityLogo from 'components/common/CommunityLogo'
import { isDaiToken } from 'constants/existingTokens'
import isEmpty from 'lodash/isEmpty'

export default ({ isClosed, networkType, token, metadata, name }) => {
  const { image } = metadata
  return (
    <div className='community_header'>
      <div className='community_header__image'>
        <CommunityLogo
          isDaiToken={isDaiToken(networkType, token)}
          token={token}
          imageUrl={!isEmpty(image) ? `${CONFIG.ipfsProxy.urlBase}/image/${image}` : null}
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
    </div>
  )
}
