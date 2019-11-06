import React from 'react'
import { isMobileOnly } from 'react-device-detect'
import CommunityLogo from 'components/common/CommunityLogo'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'

export default ({ isClosed, networkType, token, metadata, name }) => {
  return (
    <div className='community_header'>
      <div className='community_header__image'>
        <CommunityLogo
          symbol={token && token.symbol}
          imageUrl={!isEmpty(get(metadata, 'image')) ? `${CONFIG.ipfsProxy.urlBase}/image/${get(metadata, 'image')}` : null}
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
