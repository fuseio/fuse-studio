import { requestAction, createRequestTypes } from './utils'

export const GET_NETWORK_TYPE = createRequestTypes('GET_NETWORK_TYPE')
export const GETTING_ACCOUNT_ADDRESS = createRequestTypes('GETTING_ACCOUNT_ADDRESS')
export const GET_BLOCK_NUMBER = createRequestTypes('GET_BLOCK_NUMBER')

export const CHANGE_NETWORK = createRequestTypes('CHANGE_NETWORK')
export const UNSUPPORTED_NETWORK_ERROR = 'UNSUPPORTED_NETWORK_ERROR'

export const CHECK_ACCOUNT_CHANGED = createRequestTypes('CHECK_ACCOUNT_CHANGED')
export const ACCOUNT_LOGGED_OUT = 'ACCOUNT_LOGGED_OUT'

export const FETCH_GAS_PRICES = createRequestTypes('FETCH_GAS_PRICES')

export const SEND_TRANSACTION_HASH = createRequestTypes('SEND_TRANSACTION_HASH')

export const getNetworkType = (enableProvider) => requestAction(GET_NETWORK_TYPE, { enableProvider })
export const getBlockNumber = (networkType, bridgeType) => requestAction(GET_BLOCK_NUMBER, { networkType, bridgeType })

export const changeNetwork = (networkType) => requestAction(CHANGE_NETWORK, { networkType })
export const checkAccountChanged = (selectedAddress) => requestAction(CHECK_ACCOUNT_CHANGED,
  { selectedAddress })

export const fetchGasPrices = () => requestAction(FETCH_GAS_PRICES)

export const sendTransactionHash = (transactionHash, abiName) => requestAction(SEND_TRANSACTION_HASH, { transactionHash, abiName })
