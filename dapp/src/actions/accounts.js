import { createRequestTypes, action, createEntityAction } from './utils'

const communitiesAction = createEntityAction('communities')

export const FETCH_COMMUNITIES = createRequestTypes('FETCH_COMMUNITIES')
export const BALANCE_OF_TOKEN = createRequestTypes('BALANCE_OF_TOKEN')
export const BALANCE_OF_NATIVE = createRequestTypes('BALANCE_OF_NATIVE')
export const BALANCE_OF_FUSE = createRequestTypes('BALANCE_OF_FUSE')
export const GET_INITIAL_ADDRESS = createRequestTypes('GET_INITIAL_ADDRESS')

export const FETCH_BALANCES = createRequestTypes('FETCH_BALANCES')
export const ADD_USER = createRequestTypes('ADD_USER')

export const SIGN_IN = createRequestTypes('SIGN_IN')
export const CREATE_3BOX_PROFILE = createRequestTypes('CREATE_3BOX_PROFILE')

export const POSTPONE_ACTION = createRequestTypes('POSTPONE_ACTION')
export const EXECUTE_POSTPONED_ACTION = 'EXECUTE_POSTPONED_ACTION'

export const balanceOfToken = (tokenAddress, accountAddress, options) => action(BALANCE_OF_TOKEN.REQUEST, { tokenAddress, accountAddress, options })
export const balanceOfNative = (accountAddress, options) => action(BALANCE_OF_NATIVE.REQUEST, { accountAddress, options })
export const balanceOfFuse = (accountAddress) => action(BALANCE_OF_FUSE.REQUEST, { accountAddress })

export const fetchBalances = (tokens, accountAddress) => action(FETCH_BALANCES.REQUEST, { accountAddress, tokens })
export const fetchCommunities = (accountAddress) => communitiesAction(FETCH_COMMUNITIES.REQUEST, { accountAddress })

export const getInitialAddress = () => action(GET_INITIAL_ADDRESS.REQUEST)
export const signIn = (accountAddress) => action(SIGN_IN.REQUEST, { accountAddress })
export const create3boxProfile = (accountAddress, data) => action(CREATE_3BOX_PROFILE.REQUEST, { accountAddress, data })

export const postponedActionExecuted = (accountAddress, postponed) => action(EXECUTE_POSTPONED_ACTION, { accountAddress, postponed })
export const postponeAction = (accountAddress, postponed) => action(POSTPONE_ACTION.REQUEST, { accountAddress, postponed })
