import {action, createRequestTypes, createEntityAction, createTransactionRequestTypes} from './utils'

export const entityName = 'tokens'
const tokenAction = createEntityAction(entityName)

export const FETCH_TOKENS = createRequestTypes('FETCH_TOKENS')
export const FETCH_TOKENS_BY_OWNER = createRequestTypes('FETCH_TOKENS_BY_OWNER')

export const FETCH_TOKEN = createRequestTypes('FETCH_TOKEN')

export const FETCH_CLN_TOKEN = createRequestTypes('FETCH_CLN_TOKEN')

export const CREATE_TOKEN = createTransactionRequestTypes('CREATE_TOKEN')
export const CREATE_TOKEN_WITH_METADATA = createTransactionRequestTypes('CREATE_TOKEN_WITH_METADATA')

export const FETCH_TOKEN_STATISTICS = createRequestTypes('FETCH_TOKEN_STATISTICS')

export const fetchTokens = (page) => tokenAction(FETCH_TOKENS.REQUEST, {page})
export const fetchTokensByOwner = (owner) => tokenAction(FETCH_TOKENS_BY_OWNER.REQUEST, {owner})

export const fetchToken = (tokenAddress) => tokenAction(FETCH_TOKEN.REQUEST, {tokenAddress})

export const fetchClnToken = () => tokenAction(FETCH_CLN_TOKEN.REQUEST)

export const createToken = (tokenData) => action(CREATE_TOKEN.REQUEST, tokenData)
export const createTokenWithMetadata = (tokenData, metadata) => action(CREATE_TOKEN_WITH_METADATA.REQUEST, {tokenData, metadata})

export const fetchTokenStatistics = (tokenAddress, activityType, interval) => action(FETCH_TOKEN_STATISTICS.REQUEST,
  {tokenAddress, activityType, interval})
