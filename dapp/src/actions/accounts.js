import { createRequestTypes, action, createEntityAction } from './utils'

const communitiesAction = createEntityAction('communities')

export const FETCH_COMMUNITIES = createRequestTypes('FETCH_COMMUNITIES')
export const BALANCE_OF_TOKEN = createRequestTypes('BALANCE_OF_TOKEN')
export const BALANCE_OF_NATIVE = createRequestTypes('BALANCE_OF_NATIVE')
export const BALANCE_OF_FUSE = createRequestTypes('BALANCE_OF_FUSE')

export const FETCH_BALANCES = createRequestTypes('FETCH_BALANCES')
export const FETCH_TOKENS_WITH_BALANCES = createRequestTypes('FETCH_TOKENS_WITH_BALANCES')
export const ADD_USER = createRequestTypes('ADD_USER')

export const SIGN_IN = createRequestTypes('SIGN_IN')
export const CREATE_3BOX_PROFILE = createRequestTypes('CREATE_3BOX_PROFILE')
export const SEND_EMAIL = createRequestTypes('SEND_EMAIL')

export const balanceOfToken = (tokenAddress, accountAddress, options) => action(BALANCE_OF_TOKEN.REQUEST, { tokenAddress, accountAddress, options })
export const balanceOfNative = (accountAddress, options) => action(BALANCE_OF_NATIVE.REQUEST, { accountAddress, options })
export const balanceOfFuse = (accountAddress) => action(BALANCE_OF_FUSE.REQUEST, { accountAddress })

export const fetchBalances = (tokens, accountAddress) => action(FETCH_BALANCES.REQUEST, { accountAddress, tokens })
export const fetchTokensWithBalances = (accountAddress) => action(FETCH_TOKENS_WITH_BALANCES.REQUEST, { accountAddress })
export const fetchCommunities = (accountAddress) => communitiesAction(FETCH_COMMUNITIES.REQUEST, { accountAddress })

export const signIn = (accountAddress) => action(SIGN_IN.REQUEST, { accountAddress })
export const create3boxProfile = (accountAddress, data) => action(CREATE_3BOX_PROFILE.REQUEST, { accountAddress, data })

export const sendEmail = (email) => action(SEND_EMAIL.REQUEST, { email })
