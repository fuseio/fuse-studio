import filter from 'lodash/filter'
import pickBy from 'lodash/pickBy'
import find from 'lodash/find'
import { createSelector } from 'reselect'

export const getCommunity = (state, address) => ({...state.tokens[address], ...state.marketMaker[address]})

export const getCommunityTokens = createSelector(
  state => state.tokens,
  (tokens) => filter(tokens, {isLocalCurrency: true})
)

export const getCommunities = createSelector(
  getCommunityTokens,
  state => state.marketMaker,
  (tokens, marketMaker) =>
    tokens.map(token => ({...token, ...marketMaker[token.address]}))
)

export const getMarketMaker = createSelector(
  state => state.tokens,
  state => state.marketMaker,
  (tokens, marketMaker) => {
    const marketToken = Object.keys(tokens).map(token => ({
      ...marketMaker[token],
      'tokenName': tokens[token].symbol
    }))
    return marketToken.filter(token => token.isMarketMakerLoaded: true)
  }
)

export const getCommunitiesWithMetadata = createSelector(getCommunities, (communities) =>
  filter(communities, community => community.metadata)
)

export const getTokensWithMetadata = createSelector(state => state.tokens, (tokens) =>
  pickBy(tokens, token => token.metadata)
)

export const getSelectedCommunity = createSelector(
  getCommunities,
  state => state.router.location.pathname,
  (communities, pathname) => find(communities, {path: pathname}) || {}
)

export const getSelectedToken = createSelector(
  state => state.tokens,
  state => state.router.location.pathname,
  (tokens, pathname) => find(tokens, {path: pathname})
)

export const getClnToken = createSelector(state => state.tokens, (tokens) =>
  find(tokens, {isLocalCurrency: false})
)
