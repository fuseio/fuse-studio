import React, { memo } from 'react'
import { connect } from 'react-redux'
import CommunityLogo from 'components/common/CommunityLogo'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import { getCoverPhotoUri, getImageUri } from 'utils/metadata'

const FeaturedCommunity = memo(({
  community,
  showDashboard,
  token,
  metadata,
  withDescription
}) => {
  return (
    <div className='featured' onClick={showDashboard}>
      <div className='featured__image'>
        <div className='featured__image__container'>
          {
            community.featured &&
              getCoverPhotoUri(community)
              ? <img alt='cover photo' src={getCoverPhotoUri(community)} />
              : getCoverPhotoUri(metadata)
                ? <img alt='cover photo' src={getCoverPhotoUri(metadata)} />
                : <img alt='cover photo' src={CommunityPlaceholderImage} />
          }
        </div>
        <div className='featured__logo'>
          <CommunityLogo
            imageUrl={getImageUri(metadata)}
            metadata={{
              isDefault: metadata && metadata.isDefault
            }}
            symbol={token && token.symbol}
          />
        </div>
      </div>
      <div className='featured__content grid-x align-top'>
        <h6 className='featured__name'>{community.name}
          {community && community.subTitle && (
            <>
              <br />
              <span style={{ fontSize: 'smaller' }}>{community.subTitle}</span>
            </>
          )}
        </h6>
        {withDescription && community && (
          <div className='featured__description'>
            {community && community.description}
          </div>
        )}
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
