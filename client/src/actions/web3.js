import {action, createRequestTypes} from './utils'

export const GET_NETWORK_TYPE = createRequestTypes('GET_NETWORK_TYPE')
export const SET_READY_STATUS = 'SET_READY_STATUS'
export const UNSUPPORTED_NETWORK_ERROR = 'UNSUPPORTED_NETWORK_ERROR'
export const SELECT_ACCOUNT = 'SELECT_ACCOUNT'
export const CHECK_ACCOUNT_CHANGE = 'CHECK_ACCOUNT_CHANGE'

export const getNetworkType = () => action(GET_NETWORK_TYPE.REQUEST)
export const selectAccount = (account) => action(SELECT_ACCOUNT,
  {response: {account, isAccountUnlocked: !!account}})
export const setReadyStatus = (isReady, account) => action(SET_READY_STATUS,
  {response: {isReady}})
export const checkAccountChange = () => action(CHECK_ACCOUNT_CHANGE)
