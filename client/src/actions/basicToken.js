import {createRequestTypes, createEntityAction, action} from './utils'

const entity = 'basicToken'

const basicTokenAction = createEntityAction(entity)

export const NAME = createRequestTypes('NAME')
export const SYMBOL = createRequestTypes('SYMBOL')
export const TOTAL_SUPPLY = createRequestTypes('TOTAL_SUPPLY')
export const TOKEN_URI = createRequestTypes('TOKEN_URI')
export const SET_TOKEN_URI = createRequestTypes('SET_TOKEN_URI')
export const OWNER = createRequestTypes('OWNER')

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const TRANSFER = createRequestTypes('TRANSFER')
export const APPROVE = createRequestTypes('APPROVE')

export const UPDATE_BALANCES = createRequestTypes('UPDATE_BALANCES')

export const FETCH_COMMUNITY = createRequestTypes('FETCH_COMMUNITY')
export const FETCH_COMMUNITY_TOKEN = createRequestTypes('FETCH_COMMUNITY_TOKEN')

export const FETCH_COMMUNITY_CONTRACT = createRequestTypes('FETCH_COMMUNITY_CONTRACT')
export const FETCH_CLN_CONTRACT = createRequestTypes('FETCH_CLN_CONTRACT')

export const TRANSFER_EVENT = 'TRANSFER_EVENT'

export const name = (tokenAddress) => basicTokenAction(NAME.REQUEST, {tokenAddress})
export const symbol = (tokenAddress) => basicTokenAction(SYMBOL.REQUEST, {tokenAddress})
export const totalSupply = (tokenAddress) => basicTokenAction(TOTAL_SUPPLY.REQUEST, {tokenAddress})
export const tokenURI = (tokenAddress) => basicTokenAction(TOKEN_URI.REQUEST, {tokenAddress})
export const setTokenURI = (tokenAddress, tokenURI) => basicTokenAction(SET_TOKEN_URI.REQUEST, {tokenAddress, tokenURI})
export const owner = (tokenAddress) => basicTokenAction(OWNER.REQUEST, {tokenAddress})

export const balanceOf = (tokenAddress, accountAddress) => basicTokenAction(BALANCE_OF.REQUEST, {tokenAddress, accountAddress})
export const transfer = (tokenAddress, to, value) => basicTokenAction(TRANSFER.REQUEST, {tokenAddress, to, value})
export const approve = (tokenAddress, spender, value) => basicTokenAction(APPROVE.REQUEST, {tokenAddress, spender, value})

export const updateBalances = (accountAddress) => action(UPDATE_BALANCES.REQUEST, {accountAddress})

export const fetchCommunity = (tokenAddress) => basicTokenAction(FETCH_COMMUNITY.REQUEST, {tokenAddress})
export const fetchClnContract = (tokenAddress) => basicTokenAction(FETCH_CLN_CONTRACT.REQUEST, {tokenAddress})
