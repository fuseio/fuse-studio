import React, { memo } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'

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
            community.featured && getCoverPhotoUri(community) ? (
              <img alt='cover photo' src={getCoverPhotoUri(community)} />
            ) : getCoverPhotoUri(metadata) ? (
              <img alt='cover photo' src={getCoverPhotoUri(metadata)} />
            ) : (
                  <img alt='cover photo' src={CommunityPlaceholderImage} />
                )
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
            <React.Fragment>
              <br />
              <span style={{ fontSize: 'smaller' }}>{community.subTitle}</span>
            </React.Fragment>
          )}</h6>
        {/* && community.description */}
        {withDescription && community && (
          <div className='featured__description'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Tenetur mollitia officiis, possimus eos laborum quisquam perspiciatis tempore quas similique repellendus laudantium!
            Nostrum quibusdam architecto et ullam possimus! Similique, laudantium doloremque!
          </div>
        )}
        {withDescription && community && (
          <div className='featured__information grid-x align-middle align-justify'>
            <div className='item cell small-8 grid-x align-middle'>
              <div className='item__icon'><FontAwesome name='info-circle' /></div>
              <div className='item__content grid-y'>
                <span>Token</span>
                <span>{token && token.symbol}</span>
              </div>
            </div>
            <div className='item cell small-8 grid-x align-middle'>
              <div className='item__icon'><FontAwesome name='info-circle' /></div>
              <div className='item__content grid-y'>
                <span>Business</span>
                <span>400</span>
              </div>
            </div>
            <div className='item cell small-8 grid-x align-middle'>
              <div className='item__icon'><FontAwesome name='info-circle' /></div>
              <div className='item__content grid-y'>
                <span>Users</span>
                <span>100</span>
              </div>
            </div>
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
