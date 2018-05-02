import {action, createRequestTypes} from './utils'

export const SUPPORTS_TOKEN = createRequestTypes('SUPPORTS_TOKEN')
export const TOKENS = createRequestTypes('TOKENS')
export const CREATE_CURRENCY = createRequestTypes('CREATE_CURRENCY')
export const OPEN_MARKET = createRequestTypes('OPEN_MARKET')
export const SET_TOKEN_URI = createRequestTypes('SET_TOKEN_URI')

export const supportsToken = (address) => action(SUPPORTS_TOKEN.REQUEST, {address})
export const tokens = (index) => action(TOKENS.REQUEST, {index})
export const createCurrency = (currencyData) => action(CREATE_CURRENCY.REQUEST, {currencyData})
export const openMarket = (address) => action(OPEN_MARKET.REQUEST, {address})
export const setTokenURI = (address, tokenURI) => action(SET_TOKEN_URI.REQUEST, {address, tokenURI})
