import {createRequestTypes, action} from './utils'

export const BALANCE_OF_TOKEN = createRequestTypes('BALANCE_OF_TOKEN')
export const BALANCE_OF_NATIVE = createRequestTypes('BALANCE_OF_NATIVE')
export const BALANCE_OF_CLN = createRequestTypes('BALANCE_OF_CLN')

export const FETCH_BALANCES = createRequestTypes('FETCH_BALANCES')
export const FETCH_TOKENS_WITH_BALANCES = createRequestTypes('FETCH_TOKENS_WITH_BALANCES')
export const ADD_USER = createRequestTypes('ADD_USER')

export const balanceOfToken = (tokenAddress, accountAddress) => action(BALANCE_OF_TOKEN.REQUEST, {tokenAddress, accountAddress})
export const balanceOfNative = (accountAddress) => action(BALANCE_OF_NATIVE.REQUEST, {accountAddress})
export const balanceOfCln = (accountAddress) => action(BALANCE_OF_CLN.REQUEST, {accountAddress})

export const fetchBalances = (tokens, accountAddress) => action(FETCH_BALANCES.REQUEST, {accountAddress, tokens})
export const fetchTokensWithBalances = (accountAddress) => action(FETCH_TOKENS_WITH_BALANCES.REQUEST, {accountAddress})
