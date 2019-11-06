import React, { memo } from 'react'
import CommunityPlaceholderImage from 'images/community_placeholder.png'

const FeaturedCommunity = memo(({
  community,
  showDashboard,
  metadata
}) => {
  return (
    <div className='featured' onClick={showDashboard}>
      <div className='featured__image'>
        <div className='featured__image__container'>
          <img alt='cover photo' src={community.coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${community.coverPhoto}` : CommunityPlaceholderImage} />
        </div>
        <div className='featured__logo'>
          <img alt='logo photo' src={metadata && metadata.image && `${CONFIG.ipfsProxy.urlBase}/image/${metadata && metadata.image}`} />
        </div>
      </div>
      <div className='featured__content'>
        <h6 className='featured__name'>{community.name}</h6>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.community !== nextProps.community) {
    return false
  }
  if (prevProps.metadata !== nextProps.metadata) {
    return false
  }
  return true
})

export default FeaturedCommunity
