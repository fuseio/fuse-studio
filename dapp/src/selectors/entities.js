import { createSelector } from 'reselect'
import { getAccountAddress } from './accounts'
import sortBy from 'lodash/sortBy'
import get from 'lodash/get'
import { getCurrentCommunity } from 'selectors/dashboard'

const { addresses: { fuse: { funder: funderAddress } } } = CONFIG.web3

export const getCommunityAddress = state => state.screens.dashboard && state.screens.dashboard.communityAddress

export const getEntities = createSelector(
  getCurrentCommunity,
  (community) => get(community, 'communityEntities', {})
)

export const getUsersEntities = createSelector(
  state => state.screens.communityEntities.usersResults,
  state => state.entities.communityEntities,
  (usersResults, communityEntities) => sortBy(usersResults.map(account => communityEntities[account]).filter(obj => !!obj), ['updatedAt']).reverse() || []
)

export const getBusinessesEntities = createSelector(
  state => state.screens.communityEntities.merchantsResults,
  state => state.entities.communityEntities,
  (merchantsResults, communityEntities) => sortBy(merchantsResults.map(account => communityEntities[account]).filter(obj => !!obj), ['updatedAt']).reverse() || []
)

export const getEntity = createSelector(
  getAccountAddress,
  getEntities,
  (accountAddress, communityEntities) => {
    if (accountAddress) {
      return get(communityEntities, accountAddress.toLowerCase(), {})
    }
    return {}
  }
)

export const checkIsAdmin = createSelector(
  getEntity,
  (entity) => {
    return get(entity, 'isAdmin')
  }
)

export const checkIsFunderPartOfCommunity = createSelector(
  state => state.entities.communityEntities,
  (communityEntities) => {
    const funder = funderAddress.toLowerCase()
    return !!communityEntities[funder]
  }
)
