import {createRequestTypes, createEntityAction, action} from './utils'

export const entityName = 'communities'

const communityAction = createEntityAction(entityName)

export const FETCH_COMMUNITY_TOKEN = createRequestTypes('FETCH_COMMUNITY_TOKEN')
export const FETCH_COMMUNITY = createRequestTypes('FETCH_COMMUNITY')
export const INITIALIZE_COMMUNITY = createRequestTypes('INITIALIZE_COMMUNITY')

export const FETCH_COMMUNITIES = createRequestTypes('FETCH_COMMUNITIES')
export const FETCH_COMMUNITIES_BY_OWNER = createRequestTypes('FETCH_COMMUNITIES_BY_OWNER')

export const FETCH_CLN_CONTRACT = createRequestTypes('FETCH_CLN_CONTRACT')

export const ISSUE_COMMUNITY = createRequestTypes('ISSUE_COMMUNITY')

export const fetchCommunity = (tokenAddress) => communityAction(FETCH_COMMUNITY.REQUEST, {tokenAddress})
export const initializeCommunity = (tokenAddress) => action(INITIALIZE_COMMUNITY.REQUEST,
  {tokenAddress})

export const fetchCommunities = (page) => communityAction(FETCH_COMMUNITIES.REQUEST, {page})

export const fetchCommunitiesByOwner = (owner) => communityAction(FETCH_COMMUNITIES_BY_OWNER.REQUEST, {owner})

export const fetchClnContract = (tokenAddress) => communityAction(FETCH_CLN_CONTRACT.REQUEST, {tokenAddress})

export const issueCommunity = (communityMetadata, currencyData) => communityAction(ISSUE_COMMUNITY.REQUEST, {
  communityMetadata,
  currencyData
})
