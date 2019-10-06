import React, { useEffect, memo } from 'react'
import { connect } from 'react-redux'
import { fetchMetadata } from 'actions/metadata'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken, fetchFeaturedCommunities } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import { withRouter } from 'react-router-dom'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import isEmpty from 'lodash/isEmpty'
import { fetchCommunities } from 'actions/accounts'
import Community from 'components/common/Community'
import FeaturedCommunity from 'components/common/FeaturedCommunity'

const FeaturedCommunities = memo(({
  metadata,
  networkType,
  account,
  history,
  communitiesKeys,
  communities,
  fetchMetadata,
  setTitle,
  tokens,
  fetchCommunities,
  fetchFeaturedCommunities,
  featuredCommunities
}) => {
  useEffect(() => {
    fetchFeaturedCommunities(account)
    fetchCommunities(account)
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

  let communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token).slice(0, 4)

  if (!isEmpty(communitiesIOwn)) {
    setTitle('My communities')
  } else {
    setTitle('Featured communities')
  }

  return (
    <div className='grid-x align-justify grid-margin-x grid-margin-y'>
      {
        !isEmpty(communitiesIOwn) ? communitiesIOwn.slice(0, 4).map((entity, index) => {
          const { community: { communityAddress }, token } = entity
          const { tokenURI } = token
          return (
            <div className='cell medium-12' key={index}>
              <Community
                networkType={networkType}
                token={{ ...token, communityAddress }}
                metadata={metadata[tokenURI]}
                history={history}
                account={account}
                showDashboard={showDashboard}
              />
            </div>
          )
        }) : !isEmpty(featuredCommunities) ? featuredCommunities.map((address, index) => {
          const token = tokens[communities[address].foreignTokenAddress]
          const community = communities[address]
          if (token && community) {
            return (
              <div className='cell medium-12 small-24' key={address}>
                <FeaturedCommunity
                  fetchMetadata={fetchMetadata}
                  metadata={metadata[token.tokenURI]}
                  showDashboard={showDashboard}
                  token={token}
                  community={community}
                  communityAddress={community.communityAddress}
                />
              </div>
            )
          }
        }) : [1, 2, 3, 4].map((img, index) =>
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
  } else if (prevProps.metadata !== nextProps.metadata) {
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
  communitiesKeys: state.accounts && state.accounts[state.network && state.network.accountAddress] && state.accounts[state.network && state.network.accountAddress].communities,
  featuredCommunities: state.accounts.featuredCommunities
})

const mapDispatchToProps = {
  fetchTokens,
  fetchTokensByOwner,
  loadModal,
  fetchFuseToken,
  fetchMetadata,
  fetchCommunities,
  fetchFeaturedCommunities
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FeaturedCommunities))
