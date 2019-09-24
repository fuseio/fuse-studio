import React, { useEffect, memo } from 'react'
import CommunityPlaceholderImage from 'images/community_placeholder.png'

const FeaturedCommunity = memo(({
  community,
  token: { name, tokenURI },
  communityAddress,
  showDashboard,
  metadata,
  fetchMetadata
}) => {
  useEffect(() => {
    if (tokenURI) {
      fetchMetadata(tokenURI)
    }
  }, [tokenURI])

  return (
    <div className='featured' onClick={() => showDashboard(communityAddress)}>
      <div className='featured__image'>
        <div className='featured__image__container'>
          <img alt='cover photo' src={community.coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${community.coverPhoto}` : CommunityPlaceholderImage} />
        </div>
        <div className='featured__logo'>
          <img alt='logo photo' src={`${CONFIG.ipfsProxy.urlBase}/image/${metadata && metadata.image}`} />
        </div>
      </div>
      <div className='featured__content'>
        <h6 className='featured__name'>{name}</h6>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.token !== nextProps.token) {
    return false
  }
  if (prevProps.metadata !== nextProps.metadata) {
    return false
  }
  return true
})

export default FeaturedCommunity
