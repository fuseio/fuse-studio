import {createRequestTypes, requestAction} from './utils'

export const LOGIN = createRequestTypes('LOGIN')
export const LOGOUT = createRequestTypes('LOGOUT')

export const login = () => requestAction(LOGIN)
export const logout = () => requestAction(LOGOUT)
