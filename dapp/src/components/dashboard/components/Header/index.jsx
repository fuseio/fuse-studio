import React from 'react'
import CommunityLogo from 'components/common/CommunityLogo'
import PlusIcon from 'images/plus.svg'

import { getImageUri } from 'utils/metadata'

export default ({ token, metadata, name, handleJoinCommunity, withLogo }) => {
  return (
    <div className='community_header'>
      {withLogo && (
        <div className='community_header__image'>
          <CommunityLogo
            symbol={token && token.symbol}
            imageUrl={getImageUri(metadata)}
            metadata={metadata}
          />
        </div>
      )}
      <div className='community_header__content'>
        <div className='name__wrapper'>
          <h2 className='name'>{name} community</h2>
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
