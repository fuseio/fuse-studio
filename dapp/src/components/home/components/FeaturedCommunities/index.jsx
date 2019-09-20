import React, { useEffect, memo } from 'react'
import { connect } from 'react-redux'
import { fetchMetadata } from 'actions/metadata'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import { withRouter } from 'react-router-dom'
import GoogleImage from 'images/google-card.png'
import McdonaldsImage from 'images/mcdonalds.png'
import StarbucksImage from 'images/starbucks-card.png'
import WalmartImage from 'images/walmart.png'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import Community from 'components/common/Community'
import isEmpty from 'lodash/isEmpty'
import { fetchCommunities } from 'actions/accounts'

const staticImages = [
  GoogleImage,
  McdonaldsImage,
  StarbucksImage,
  WalmartImage
]

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

const FeaturedCommunities = memo(({
  metadata,
  networkType,
  account,
  history,
  communitiesKeys,
  communities,
  fetchMetadata,
  setTitle,
  fetchCommunities
}) => {
  useEffect(() => {
    fetchCommunities(account)
    return () => { }
  }, [account])

  useEffect(() => {
    if (account) {
      fetchTokensByOwner(networkType, account)
    }
    return () => { }
  }, [account])

  const showDashboard = (communityAddress) => {
    history.push(`/view/community/${communityAddress}`)
  }

  let filteredCommunities = []
  if (communitiesKeys) {
    filteredCommunities = communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj)
  }
  let communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token)

  if (!isEmpty(communitiesIOwn)) {
    setTitle('My communities')
  } else {
    filteredCommunities = Object.values(communities)
  }

  return (
    <div className='grid-x align-justify grid-margin-x grid-margin-y'>
      {
        !isEmpty(communitiesIOwn) ? communitiesIOwn.slice(0, 4).map((entity, index) => {
          const { community: { communityAddress } } = entity
          return (
            <div className='cell medium-12' key={index}>
              <Community
                networkType={networkType}
                token={{ ...entity.token, communityAddress }}
                metadata={metadata[entity.tokenURI]}
                history={history}
                account={account}
                showDashboard={showDashboard}
              />
            </div>
          )
        }) : !isEmpty(filteredCommunities) ? filteredCommunities.map(({ token, community, communityAddress }, index) => {
          return (
            <div className='cell medium-12 small-24' key={index}>
              <FeaturedCommunity fetchMetadata={fetchMetadata} metadata={metadata[token.tokenURI]} showDashboard={showDashboard} token={token} community={community} communityAddress={communityAddress} />
            </div>
          )
        }) : staticImages.map((img, index) =>
          <div key={index} className='medium-12 cell'><img src={CommunityPlaceholderImage} /></div>
        )
      }
    </div>
  )
}, (prevProps, nextProps) => {
  if (prevProps.account !== nextProps.account) {
    return false
  } else if (prevProps.communitiesKeys !== nextProps.communitiesKeys) {
    return false
  } else if (prevProps.communities !== nextProps.communities) {
    return false
  }
  return true
})

const mapStateToProps = state => ({
  tokens: state.entities.tokens,
  metadata: state.entities.metadata,
  account: getAccountAddress(state),
  foreignNetwork: getForeignNetwork(state),
  communities: state.entities.communities,
  networkType: state.network.networkType,
  communitiesKeys: state.accounts && state.accounts[state.network && state.network.accountAddress] && state.accounts[state.network && state.network.accountAddress].communities
})

const mapDispatchToProps = {
  fetchTokens,
  fetchTokensByOwner,
  loadModal,
  fetchFuseToken,
  fetchMetadata,
  fetchCommunities
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FeaturedCommunities))
