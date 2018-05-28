import {action, createRequestTypes} from './utils'

export const GET_NETWORK_TYPE = createRequestTypes('GET_NETWORK_TYPE')
export const SET_READY_STATUS = 'SET_READY_STATUS'
export const UNSUPPORTED_NETWORK_ERROR = 'UNSUPPORTED_NETWORK_ERROR'

export const getNetworkType = () => action(GET_NETWORK_TYPE.REQUEST)
export const setReadyStatus = (isReady, account) => action(SET_READY_STATUS,
  {response: {isReady, account, isAccountUnlocked: !!account}})
