import filter from 'lodash/filter'
import find from 'lodash/find'
import { createSelector } from 'reselect'

export const getCommunities = createSelector(state => state.tokens, (tokens) =>
  filter(tokens,{isLocalCurrency: true})
)

export const getSelectedCommunity = createSelector(
  getCommunities,
  state => state.router.location.pathname,
  (communities, pathname) => find(communities, {path: pathname})
)
