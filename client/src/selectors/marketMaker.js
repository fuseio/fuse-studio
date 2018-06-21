import find from 'lodash/find'
// import { createSelector } from 'reselect'

export const getQuotePair = (state, {fromToken, toToken}) => find(state.marketMaker.quotePairs,
  {fromToken, toToken})
