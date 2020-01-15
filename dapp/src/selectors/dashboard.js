import { createSelector } from 'reselect'
import { createMatchSelector } from 'connected-react-router'
import { getBridgeStatus } from 'selectors/network'
import has from 'lodash/has'
import get from 'lodash/get'

const getCommunities = state => state.entities.communities

export const getTokenAddressOfByNetwork = (state, community) => {
  if (community) {
    const { homeTokenAddress, foreignTokenAddress } = community
    const { homeNetwork, bridgeStatus } = getInfo(state)
    return homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress
  }
}

const communityAddressMatchSelector = createMatchSelector({ path: '/view/community/:communityAddress' })
export const getCommunityAddress = (state) => get(communityAddressMatchSelector(state), 'params.communityAddress')

export const getCurrentCommunity = createSelector(
  getCommunityAddress,
  getCommunities,
  (communityAddress, communities) => {
    if (communityAddress) {
      const community = communities[communityAddress]
      return has(community, 'community') ? community.community : community
    }
    return null
  }
)

export const getInfo = createSelector(
  state => state.network.homeNetwork,
  getBridgeStatus,
  (homeNetwork, bridgeStatus) => ({ homeNetwork, bridgeStatus })
)

export const getTokenUtil = createSelector(
  state => state.entities.communities,
  state => state.entities.tokens,
  (communities, tokens) => {
    return { communities, tokens }
  }
)
