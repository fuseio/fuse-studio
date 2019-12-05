import React, { useEffect, memo } from 'react'
import { connect } from 'react-redux'
import { fetchTokens, fetchTokensByOwner, fetchFuseToken, fetchFeaturedCommunities } from 'actions/token'
import { loadModal } from 'actions/ui'
import { getAccountAddress } from 'selectors/accounts'
import { getForeignNetwork } from 'selectors/network'
import { withRouter } from 'react-router'
import CommunityPlaceholderImage from 'images/community_placeholder.png'
import isEmpty from 'lodash/isEmpty'
import { fetchCommunities } from 'actions/accounts'
import FeaturedCommunity from 'components/common/FeaturedCommunity'
import { push } from 'connected-react-router'
import Carousel from 'components/common/Carousel'
import arrow from 'images/arrow_3.svg'

const FeaturedCommunities = memo(({
  metadata,
  account,
  history,
  communitiesKeys,
  communities,
  tokens,
  fetchCommunities,
  fetchFeaturedCommunities,
  featuredCommunities,
  push
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
      }
    }
    push(`/view/community/${communityAddress}`)
  }

  let filteredCommunities = []
  if (communitiesKeys) {
    filteredCommunities = communitiesKeys
      .map((communityAddress) => communities[communityAddress])
      .filter(obj => !!obj)
  }

  const showCommunities = () => {
    push('/view/communities')
  }

  let communitiesIOwn = filteredCommunities.filter(({ isAdmin, token }) => isAdmin && token).slice(0, 4)

  return (
    <div className='featured__carousel__wrapper grid-x align-justify'>
      <h3 className='featured__carousel__title'>Recent communities</h3>
      <div className='featured__carousel'>
        <Carousel>
          {
            !isEmpty(communitiesIOwn) ? communitiesIOwn.slice(0, 4).map((entity, index) => {
              const { community, token } = entity
              const { communityAddress } = community
              return (
                <div className='cell medium-12 small-24' key={index}>
                  <FeaturedCommunity
                    metadata={{
                      ...metadata[token.tokenURI],
                      ...metadata[community.communityURI]
                    }}
                    showDashboard={() => showDashboard(communityAddress)}
                    community={community}
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
              <div key={index} className='cell medium-12 small-24'>
                <img style={{ width: '100%', height: '100%' }} src={CommunityPlaceholderImage} />
              </div>
            )
          }
        </Carousel>
      </div>
      <div onClick={showCommunities} className='faq__action'>
        Learn more&nbsp;<img src={arrow} alt='arrow' />
      </div>
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
  fetchFeaturedCommunities,
  push
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FeaturedCommunities))
