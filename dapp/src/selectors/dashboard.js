import { createSelector } from 'reselect'
import { createMatchSelector } from 'connected-react-router'
import { getBridgeStatus } from 'selectors/network'
import has from 'lodash/has'
import get from 'lodash/get'

export const getIsMultiBridge = state => state.screens.dashboard && state.screens.dashboard.isMultiBridge

const getCommunities = state => state.entities.communities

export const getHomeToken = state => state.screens.dashboard && state.screens.dashboard.homeTokenAddress

export const getHomeTokenAddress = (state, community) => {
  if (community) {
    const isMultiBridge = getIsMultiBridge(state)
    const { homeTokenAddress } = community
    return isMultiBridge ? getHomeToken(state) : homeTokenAddress
  }
}

export const getTokenAddressOfByNetwork = (state, community) => {
  if (community) {
    const { foreignTokenAddress } = community
    const { homeNetwork, bridgeStatus } = getInfo(state)
    const homeTokenAddress = getHomeTokenAddress(state, community)
    return homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress
  }
}

const communityAddressMatchSelector = createMatchSelector({ path: '/view/community/:address' })
export const getCommunityAddress = (state) => get(communityAddressMatchSelector(state), 'params.address')

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
