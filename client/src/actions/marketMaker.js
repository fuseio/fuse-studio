import {action, createRequestTypes} from './utils'

export const GET_CURRENT_PRICE = createRequestTypes('GET_CURRENT_PRICE')
export const CLN_RESERVE = createRequestTypes('CLN_RESERVE')
export const CC_RESERVE = createRequestTypes('CC_RESERVE')

export const QUOTE = createRequestTypes('QUOTE')

export const getCurrentPrice = (address, contractAddress) => action(GET_CURRENT_PRICE.REQUEST, {address, contractAddress})
export const clnReserve = (address, contractAddress) => action(CLN_RESERVE.REQUEST, {address, contractAddress})
export const ccReserve = (address, contractAddress) => action(CC_RESERVE.REQUEST, {address, contractAddress})

export const quote = (fromToken, inAmount, toToken) => action(QUOTE.REQUEST, {fromToken, inAmount, toToken})
