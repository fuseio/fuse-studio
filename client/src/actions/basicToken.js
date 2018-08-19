import {createRequestTypes, createEntityAction, action} from './utils'

const entity = 'basicToken'

const basicTokenAction = createEntityAction(entity)

export const FETCH_COMMUNITY_TOKEN = createRequestTypes('FETCH_COMMUNITY_TOKEN')
export const FETCH_COMMUNITY = createRequestTypes('FETCH_COMMUNITY')
export const INITIALIZE_COMMUNITY = createRequestTypes('INITIALIZE_COMMUNITY')

export const FETCH_CLN_CONTRACT = createRequestTypes('FETCH_CLN_CONTRACT')

export const fetchCommunity = (tokenAddress) => basicTokenAction(FETCH_COMMUNITY.REQUEST, {tokenAddress})
export const initializeCommunity = (tokenAddress) => action(INITIALIZE_COMMUNITY.REQUEST,
  {tokenAddress})

export const fetchClnContract = (tokenAddress) => basicTokenAction(FETCH_CLN_CONTRACT.REQUEST, {tokenAddress})
