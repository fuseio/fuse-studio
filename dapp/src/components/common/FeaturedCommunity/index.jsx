import React, { memo, useEffect } from 'react'
import { connect } from 'react-redux'
import { fetchToken } from 'actions/token'
import { fetchMetadata } from 'actions/metadata'
import { balanceOfToken } from 'actions/accounts'

import CommunityLogo from 'components/common/CommunityLogo'

import CommunityPlaceholderImage from 'images/community_placeholder.png'

const FeaturedCommunity = memo(({
  accountAddress,
  community,
  showDashboard,
  metadata,
  symbol
}) => {
  const {
    communityURI,
    homeTokenAddress,
    foreignTokenAddress
  } = community

  useEffect(() => {
    if (accountAddress) {
      balanceOfToken(homeTokenAddress, accountAddress, { bridgeType: 'home' })
      balanceOfToken(foreignTokenAddress, accountAddress, { bridgeType: 'foreign' })
    }

    fetchMetadata(communityURI)
    fetchToken(homeTokenAddress)
    fetchToken(foreignTokenAddress)
  }, [])

  return (
    <div className='featured' onClick={showDashboard}>
      <div className='featured__image'>
        <div className='featured__image__container'>
          {
            community.featured && (
              <img alt='cover photo' src={community.coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${community.coverPhoto}` : CommunityPlaceholderImage} />
            )
          }
          {
            metadata && metadata.coverPhoto && typeof metadata.coverPhoto === 'string' && (
              <img alt='cover photo' src={metadata.coverPhoto ? `${CONFIG.ipfsProxy.urlBase}/image/${metadata.coverPhoto}` : CommunityPlaceholderImage} />
            )
          }
          {
            metadata && metadata.coverPhoto && typeof metadata.coverPhoto !== 'string' && !community.featured && (
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
            symbol={symbol}
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
  if (prevProps.accountAddress !== nextProps.accountAddress) {
    return false
  }
  return true
})

export default connect(null, {
  fetchMetadata,
  fetchToken,
  balanceOfToken
})(FeaturedCommunity)
