import {action, createRequestTypes} from './utils'

export const GET_CURRENT_PRICE = createRequestTypes('GET_CURRENT_PRICE')
export const CLN_RESERVOIR = createRequestTypes('GET_CURRENT_PRICE')

export const getCurrentPrice = (address, contractAddress) => action(GET_CURRENT_PRICE.REQUEST, {address, contractAddress})
