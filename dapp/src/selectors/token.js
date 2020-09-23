import { createSelector } from 'reselect'
import get from 'lodash/get'
import { getCommunityAddress } from 'selectors/entities'

export const getHomeTokenAddress = (state, tokenAddress) =>
  state.entities.bridges[tokenAddress] && state.entities.bridges[tokenAddress].homeTokenAddress

export const getForeignTokenByCommunityAddress = createSelector(
  getCommunityAddress,
  state => state.entities.tokens,
  state => state.entities.communities,
  (communityAddress, tokens, communities) => {
    if (communityAddress && get(communities, communityAddress, null)) {
      const community = communities[communityAddress]
      return tokens[community.foreignTokenAddress]
    }
    return null
  }
)
