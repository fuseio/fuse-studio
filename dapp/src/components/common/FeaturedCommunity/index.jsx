import React, { memo } from 'react'
import { connect } from 'react-redux'
// import get from 'lodash/get'
import CommunityLogo from 'components/common/CommunityLogo'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
// import BusinessIcon from 'images/featured_business.svg'
// import TokenIcon from 'images/featured_token.svg'
// import UsersIcon from 'images/featured_user.svg'
import { getCoverPhotoUri, getImageUri } from 'utils/metadata'

const FeaturedCommunity = memo(({
  community,
  showDashboard,
  token,
  metadata,
  withDescription
}) => {
  // const { count } = community
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
        {withDescription && community && (
          <div className='featured__description'>
            {community && community.description}
          </div>
        )}
        {/* {withDescription && community && (
          <div className='featured__information grid-x align-middle align-justify'>
            <div className='item cell small-7 grid-x align-middle'>
              <div className='item__icon'><img src={TokenIcon} /></div>
              <div className='item__content grid-y'>
                <span>Token</span>
                <span>{token && token.symbol}</span>
              </div>
            </div>
            <div className='item cell small-7 grid-x align-middle'>
              <div className='item__icon'><img src={BusinessIcon} /></div>
              <div className='item__content grid-y'>
                <span>Business</span>
                <span>{get(count, 'businesses', 0)}</span>
              </div>
            </div>
            <div className='item cell small-7 grid-x align-middle'>
              <div className='item__icon'><img src={UsersIcon} /></div>
              <div className='item__content grid-y'>
                <span>Users</span>
                <span>{get(count, 'users', 0)}</span>
              </div>
            </div>
          </div>
        )} */}
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
