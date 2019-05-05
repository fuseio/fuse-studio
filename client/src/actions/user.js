import { createRequestTypes, requestAction } from './utils'

export const LOGIN = createRequestTypes('LOGIN')
export const LOGOUT = createRequestTypes('LOGOUT')

export const ADD_USER = createRequestTypes('ADD_USER')
export const IS_USER_EXISTS = createRequestTypes('IS_USER_EXISTS')

export const login = () => requestAction(LOGIN)
export const logout = () => requestAction(LOGOUT)

export const addUser = (user, tokenAddress) => requestAction(ADD_USER, { user, tokenAddress })
export const isUserExists = (accountAddress) => requestAction(IS_USER_EXISTS, { accountAddress })
