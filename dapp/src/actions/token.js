import { createRequestTypes, createEntityAction, createTransactionRequestTypes, requestAction, action } from './utils'

export const entityName = 'tokens'
const tokenAction = createEntityAction(entityName)
const communitiesAction = createEntityAction('communities')

export const CLEAR_TRANSACTION_STATUS = createRequestTypes('CLEAR_TRANSACTION_STATUS')

export const FETCH_TOKENS = createRequestTypes('FETCH_TOKENS')
export const FETCH_TOKENS_BY_OWNER = createRequestTypes('FETCH_TOKENS_BY_OWNER')
export const FETCH_TOKEN_LIST = createRequestTypes('FETCH_TOKEN_LIST')

export const FETCH_TOKEN = createRequestTypes('FETCH_TOKEN')
export const FETCH_COMMUNITY_DATA = createRequestTypes('FETCH_COMMUNITY_DATA')

export const FETCH_CLN_TOKEN = createRequestTypes('FETCH_CLN_TOKEN')

export const CREATE_TOKEN = createTransactionRequestTypes('CREATE_TOKEN')
export const CREATE_TOKEN_WITH_METADATA = createTransactionRequestTypes('CREATE_TOKEN_WITH_METADATA')

export const DEPLOY_TOKEN = createRequestTypes('DEPLOY_TOKEN')

export const DEPLOY_EXISTING_TOKEN = createRequestTypes('DEPLOY_EXISTING_TOKEN')
export const FETCH_TOKEN_STATISTICS = createRequestTypes('FETCH_TOKEN_STATISTICS')

export const FETCH_TOKEN_PROGRESS = createRequestTypes('FETCH_TOKEN_PROGRESS')
export const FETCH_DEPLOY_PROGRESS = createRequestTypes('FETCH_DEPLOY_PROGRESS')

export const TRANSFER_TOKEN = createTransactionRequestTypes('TRANSFER_TOKEN')
export const MINT_TOKEN = createTransactionRequestTypes('MINT_TOKEN')
export const BURN_TOKEN = createTransactionRequestTypes('BURN_TOKEN')

export const fetchTokens = (networkType, page) => tokenAction(FETCH_TOKENS.REQUEST, { networkType, page })
export const fetchTokensByOwner = (networkType, owner) => tokenAction(FETCH_TOKENS_BY_OWNER.REQUEST, { networkType, owner })
export const fetchTokenList = (accountAddress) => tokenAction(FETCH_TOKEN_LIST.REQUEST, { accountAddress })

export const fetchToken = (tokenAddress) => tokenAction(FETCH_TOKEN.REQUEST, { tokenAddress })
export const fetchCommunity = (communityAddress) => communitiesAction(FETCH_COMMUNITY_DATA.REQUEST, { communityAddress })

export const fetchClnToken = () => tokenAction(FETCH_CLN_TOKEN.REQUEST)

export const createToken = (tokenData) => requestAction(CREATE_TOKEN, tokenData)
export const createTokenWithMetadata = (tokenData, metadata, tokenType, steps) => requestAction(CREATE_TOKEN_WITH_METADATA, { tokenData, metadata, tokenType, steps })

export const deployExistingToken = (steps) => requestAction(DEPLOY_EXISTING_TOKEN, { steps })

export const transferToken = (tokenAddress, to, value) => requestAction(TRANSFER_TOKEN, { tokenAddress, to, value })
export const mintToken = (tokenAddress, value) => requestAction(MINT_TOKEN, { tokenAddress, value })
export const burnToken = (tokenAddress, value) => requestAction(BURN_TOKEN, { tokenAddress, value })

export const fetchTokenStatistics = (tokenAddress, activityType, interval) => requestAction(FETCH_TOKEN_STATISTICS,
  { tokenAddress, activityType, interval })

export const fetchTokenProgress = (communityAddress) => requestAction(FETCH_TOKEN_PROGRESS, { communityAddress })
export const fetchDeployProgress = (id) => requestAction(FETCH_DEPLOY_PROGRESS, { id })

export const clearTransactionStatus = (transactionStatus) => action(CLEAR_TRANSACTION_STATUS.REQUEST, { transactionStatus })
