import { createSelector } from 'reselect'
import { getAccountAddress } from './accounts'
import get from 'lodash/get'
import { getCurrentCommunity } from 'selectors/dashboard'

export const getCommunityAddress = state => state.screens.dashboard && state.screens.dashboard.communityAddress

export const getEntities = createSelector(
  getCurrentCommunity,
  (community) => {
    return get(community, 'communityEntities', {})
  }
)

export const getEntity = createSelector(
  getAccountAddress,
  getEntities,
  (accountAddress, communityEntities) => {
    if (accountAddress) {
      return get(communityEntities, accountAddress.toLowerCase())
    }
  }
)

export const checkIsAdmin = createSelector(
  getEntity,
  (entity) => get(entity, 'isAdmin')
)
