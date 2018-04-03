import {action, createRequestTypes} from './index'

export const SUPPORTS_TOKEN = createRequestTypes('SUPPORTS_TOKEN')
export const TOKENS = createRequestTypes('TOKENS')
export const CREATE_CURRENCY = createRequestTypes('CREATE_CURRENCY')

export const supportsToken = (address) => action(SUPPORTS_TOKEN.REQUEST, {address})
export const tokens = (index) => action(TOKENS.REQUEST, {index})
export const createCurrency = (currencyData) => action(CREATE_CURRENCY.REQUEST, {currencyData})
