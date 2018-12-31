import {action, createRequestTypes} from './utils'

export const GET_NETWORK_TYPE = createRequestTypes('GET_NETWORK_TYPE')
export const UNSUPPORTED_NETWORK_ERROR = 'UNSUPPORTED_NETWORK_ERROR'

export const CHECK_ACCOUNT_CHANGED = createRequestTypes('CHECK_ACCOUNT_CHANGED')
export const ACCOUNT_LOGGED_OUT = 'ACCOUNT_LOGGED_OUT'

export const FETCH_GAS_PRICES = createRequestTypes('FETCH_GAS_PRICES')

export const getNetworkType = () => action(GET_NETWORK_TYPE.REQUEST)

export const checkAccountChanged = (selectedAddress) => action(CHECK_ACCOUNT_CHANGED.REQUEST,
  {selectedAddress})

export const fetchGasPrices = () => action(FETCH_GAS_PRICES.REQUEST)
