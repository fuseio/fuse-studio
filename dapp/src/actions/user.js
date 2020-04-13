import { createRequestTypes, requestAction } from './utils'

export const LOGIN = createRequestTypes('LOGIN')
export const LOGOUT = createRequestTypes('LOGOUT')

export const SIGN_UP_USER = createRequestTypes('SIGN_UP_USER')
export const IS_USER_EXISTS = createRequestTypes('IS_USER_EXISTS')
export const SEND_EMAIL = createRequestTypes('SEND_EMAIL')
export const SAVE_WIZARD_PROGRESS = createRequestTypes('SAVE_WIZARD_PROGRESS')

export const login = () => requestAction(LOGIN)
export const logout = () => requestAction(LOGOUT)

export const signUpUser = (email, subscribe) => requestAction(SIGN_UP_USER, { email, subscribe })
export const isUserExists = (accountAddress) => requestAction(IS_USER_EXISTS, { accountAddress })
export const sendEmail = (user) => requestAction(SEND_EMAIL, { user })
export const saveWizardProgress = (formData) => requestAction(SAVE_WIZARD_PROGRESS, { formData })
