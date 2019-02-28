import {createRequestTypes, createEntityAction, createTransactionRequestTypes, requestAction} from './utils'

export const entityName = 'tokens'
const tokenAction = createEntityAction(entityName)

export const FETCH_TOKENS = createRequestTypes('FETCH_TOKENS')
export const FETCH_TOKENS_BY_OWNER = createRequestTypes('FETCH_TOKENS_BY_OWNER')
export const FETCH_TOKENS_BY_ACCOUNT = createRequestTypes('FETCH_TOKENS_BY_ACCOUNT')

export const FETCH_TOKEN = createRequestTypes('FETCH_TOKEN')

export const FETCH_CLN_TOKEN = createRequestTypes('FETCH_CLN_TOKEN')

export const CREATE_TOKEN = createTransactionRequestTypes('CREATE_TOKEN')
export const CREATE_TOKEN_WITH_METADATA = createTransactionRequestTypes('CREATE_TOKEN_WITH_METADATA')

export const FETCH_TOKEN_STATISTICS = createRequestTypes('FETCH_TOKEN_STATISTICS')

export const FETCH_TOKEN_PROGRESS = createRequestTypes('FETCH_TOKEN_PROGRESS')

export const fetchTokens = (page) => tokenAction(FETCH_TOKENS.REQUEST, {page})
export const fetchTokensByOwner = (owner) => tokenAction(FETCH_TOKENS_BY_OWNER.REQUEST, {owner})
export const fetchTokensByAccount = (accountAddress) => tokenAction(FETCH_TOKENS_BY_ACCOUNT.REQUEST, {accountAddress})

export const fetchToken = (tokenAddress) => tokenAction(FETCH_TOKEN.REQUEST, {tokenAddress})

export const fetchClnToken = () => tokenAction(FETCH_CLN_TOKEN.REQUEST)

export const createToken = (tokenData) => requestAction(CREATE_TOKEN, tokenData)
export const createTokenWithMetadata = (tokenData, metadata) => requestAction(CREATE_TOKEN_WITH_METADATA, {tokenData, metadata})

export const fetchTokenStatistics = (tokenAddress, activityType, interval) => requestAction(FETCH_TOKEN_STATISTICS,
  {tokenAddress, activityType, interval})

export const fetchTokenProgress = (tokenAddress) => requestAction(FETCH_TOKEN_PROGRESS, {tokenAddress})
