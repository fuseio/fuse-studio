import { action, requestAction, createRequestTypes } from './utils'

export const CHECK_NETWORK_TYPE = createRequestTypes('CHECK_NETWORK_TYPE')
export const GET_FOREIGN_NETWORK = createRequestTypes('GET_FOREIGN_NETWORK')
export const CONNECT_TO_WALLET = createRequestTypes('CONNECT_TO_WALLET')

export const GET_BLOCK_NUMBER = createRequestTypes('GET_BLOCK_NUMBER')

export const CHANGE_NETWORK = createRequestTypes('CHANGE_NETWORK')
export const UNSUPPORTED_NETWORK_ERROR = 'UNSUPPORTED_NETWORK_ERROR'

export const CHECK_ACCOUNT_CHANGED = createRequestTypes('CHECK_ACCOUNT_CHANGED')
export const ACCOUNT_LOGGED_OUT = 'ACCOUNT_LOGGED_OUT'

export const FETCH_GAS_PRICES = createRequestTypes('FETCH_GAS_PRICES')

export const SEND_TRANSACTION_HASH = createRequestTypes('SEND_TRANSACTION_HASH')

export const SET_FOREIGN_NETWORK = 'SET_FOREIGN_NETWORK'

export const checkNetworkType = (enableProvider, provider) => requestAction(CHECK_NETWORK_TYPE, { provider, enableProvider })
export const connectToWallet = () => requestAction(CONNECT_TO_WALLET)

export const getForeignNetwork = (communityAddress) => requestAction(GET_FOREIGN_NETWORK, { communityAddress })

export const getBlockNumber = (networkType, bridgeType) => requestAction(GET_BLOCK_NUMBER, { networkType, bridgeType })

export const changeNetwork = (networkType) => requestAction(CHANGE_NETWORK, { networkType })
export const checkAccountChanged = (selectedAddress) => requestAction(CHECK_ACCOUNT_CHANGED,
  { selectedAddress })

export const fetchGasPrices = () => requestAction(FETCH_GAS_PRICES)

export const sendTransactionHash = (transactionHash, abiName) => requestAction(SEND_TRANSACTION_HASH, { transactionHash, abiName })
export const setForeignNetwork = (foreignNetwork) => action(SET_FOREIGN_NETWORK, { foreignNetwork })
