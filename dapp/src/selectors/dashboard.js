import { createSelector } from 'reselect'
import { getBridgeStatus } from 'selectors/network'

export const getToken = (state, address) => {
  if (address) {
    const { communities, tokens } = getTokenUtil(state)
    if (communities && tokens) {
      if (communities[address] && communities[address].foreignTokenAddress && tokens[communities[address].foreignTokenAddress]) {
        return tokens[communities[address].foreignTokenAddress]
      }
    }
  }
}

export const getTokenAddressOfByNetwork = (state, community) => {
  if (community) {
    const { homeTokenAddress, foreignTokenAddress } = community
    const { homeNetwork, bridgeStatus } = getInfo(state)
    return homeNetwork === bridgeStatus.from.network ? homeTokenAddress : foreignTokenAddress
  }
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
