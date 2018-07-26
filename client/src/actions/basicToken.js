import {createRequestTypes, createEntityAction, action} from './utils'

const entity = 'basicToken'

const basicTokenAction = createEntityAction(entity)

export const NAME = createRequestTypes('NAME')
export const SYMBOL = createRequestTypes('SYMBOL')
export const TOTAL_SUPPLY = createRequestTypes('TOTAL_SUPPLY')
export const TOKEN_URI = createRequestTypes('TOKEN_URI')
export const SET_TOKEN_URI = createRequestTypes('SET_TOKEN_URI')
export const OWNER = createRequestTypes('OWNER')

export const FETCH_COMMUNITY_TOKEN = createRequestTypes('FETCH_COMMUNITY_TOKEN')
export const FETCH_COMMUNITY = createRequestTypes('FETCH_COMMUNITY')
export const INITIALIZE_COMMUNITY = createRequestTypes('INITIALIZE_COMMUNITY')

export const FETCH_CLN_CONTRACT = createRequestTypes('FETCH_CLN_CONTRACT')

export const name = (tokenAddress) => basicTokenAction(NAME.REQUEST, {tokenAddress})
export const symbol = (tokenAddress) => basicTokenAction(SYMBOL.REQUEST, {tokenAddress})
export const totalSupply = (tokenAddress) => basicTokenAction(TOTAL_SUPPLY.REQUEST, {tokenAddress})
export const tokenURI = (tokenAddress) => basicTokenAction(TOKEN_URI.REQUEST, {tokenAddress})
export const setTokenURI = (tokenAddress, tokenURI) => basicTokenAction(SET_TOKEN_URI.REQUEST, {tokenAddress, tokenURI})
export const owner = (tokenAddress) => basicTokenAction(OWNER.REQUEST, {tokenAddress})

export const fetchCommunity = (tokenAddress) => basicTokenAction(FETCH_COMMUNITY.REQUEST, {tokenAddress})
export const initializeCommunity = (tokenAddress) => action(INITIALIZE_COMMUNITY.REQUEST,
  {tokenAddress})

export const fetchClnContract = (tokenAddress) => basicTokenAction(FETCH_CLN_CONTRACT.REQUEST, {tokenAddress})
