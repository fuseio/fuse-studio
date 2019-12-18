import { createSelector } from 'reselect'
import { getBridgeStatus } from 'selectors/network'

const getCommunities = state => state.entities.communities

export const getTokenAddressOfByNetwork = (state, community) => {
  if (community) {
    const { homeTokenAddress, foreignTokenAddress } = community
    const { homeNetwork, bridgeStatus } = getInfo(state)
    return homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress
  }
}

export const getCurrentCommunity = (state, communityAddress) => {
  if (communityAddress) {
    const communities = getCommunities(state)
    return communities[communityAddress]
  }
  return null
}

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
