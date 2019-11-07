import React, { useEffect, memo } from 'react'
import { connect } from 'react-redux'
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
  setTitle,
  tokens,
  fetchCommunities,
  fetchFeaturedCommunities,
  featuredCommunities
}) => {
  useEffect(() => {
    fetchFeaturedCommunities()
    if (account) {
      fetchCommunities(account)
    }
    return () => { }
  }, [account])

  const showDashboard = (communityAddress, name) => {
    if (window && window.analytics) {
      if (name) {
        window.analytics.track(`Clicked on featured community - ${name}`)
      } else {
        window.analytics.track(`Clicked on featured community`)
      }
    }
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
    setTitle('What you can do with Fuse?')
  }

  return (
    <div className='grid-x align-justify grid-margin-x grid-margin-y'>
      {
        !isEmpty(communitiesIOwn) ? communitiesIOwn.slice(0, 4).map((entity, index) => {
          const { community, token } = entity
          const { communityAddress } = community
          return (
            <div className='cell medium-12' key={index}>
              <Community
                token={{ ...token, communityAddress }}
                metadata={{
                  ...metadata[token.tokenURI],
                  ...metadata[community.communityURI]
                }}
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
                  metadata={{
                    ...metadata[token.tokenURI],
                    ...metadata[community.communityURI]
                  }}
                  showDashboard={() => showDashboard(address, community.name)}
                  community={community}
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
  fetchCommunities,
  fetchFeaturedCommunities
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FeaturedCommunities))
