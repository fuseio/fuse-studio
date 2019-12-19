import React, { memo } from 'react'
import { connect } from 'react-redux'

import CommunityLogo from 'components/common/CommunityLogo'
import CommunityPlaceholderImage from 'images/community_placeholder.png'

const FeaturedCommunity = memo(({
  community,
  showDashboard,
  token,
  metadata
}) => {
  return (
    <div className='featured' onClick={showDashboard}>
      <div className='featured__image'>
        <div className='featured__image__container'>
          {
            community.featured && community.coverPhoto ? (
              <img alt='cover photo' src={community.coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${community.coverPhoto}` : CommunityPlaceholderImage} />
            ) : metadata && metadata.coverPhoto && typeof metadata.coverPhoto === 'string' ? (
              <img alt='cover photo' src={metadata.coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${metadata.coverPhoto}` : CommunityPlaceholderImage} />
            ) : (
              <img alt='cover photo' src={CommunityPlaceholderImage} />
            )
          }
        </div>
        <div className='featured__logo'>
          <CommunityLogo
            imageUrl={metadata && metadata.image && `${CONFIG.ipfsProxy.urlBase}/image/${metadata && metadata.image}`}
            metadata={{
              isDefault: metadata && metadata.isDefault
            }}
            symbol={token && token.symbol}
          />
        </div>
      </div>
      <div className='featured__content'>
        <h6 className='featured__name'>{community.name}
          {community && community.subTitle && (
            <React.Fragment>
              <br />
              <span style={{ fontSize: 'smaller' }}>{community.subTitle}</span>
            </React.Fragment>
          )}</h6>
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

const mapState = (state, { token, community }) => ({
  metadata: {
    ...state.entities.metadata[token && token.tokenURI],
    ...state.entities.metadata[community && community.communityURI]
  }
})

export default connect(mapState, null)(FeaturedCommunity)
