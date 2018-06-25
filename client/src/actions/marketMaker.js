import {action, createRequestTypes} from './utils'

export const GET_CURRENT_PRICE = createRequestTypes('GET_CURRENT_PRICE')
export const CLN_RESERVE = createRequestTypes('CLN_RESERVE')
export const CC_RESERVE = createRequestTypes('CC_RESERVE')

export const FETCH_MARKET_MAKER_DATA = createRequestTypes('FETCH_MARKET_MAKER_DATA')

export const QUOTE = createRequestTypes('QUOTE')
export const INVERT_QUOTE = createRequestTypes('INVERT_QUOTE')
export const CHANGE = createRequestTypes('CHANGE')
export const SLIPPAGE = createRequestTypes('SLIPPAGE')

export const getCurrentPrice = (address, contractAddress) => action(GET_CURRENT_PRICE.REQUEST, {address, contractAddress})
export const clnReserve = (address, contractAddress) => action(CLN_RESERVE.REQUEST, {address, contractAddress})
export const ccReserve = (address, contractAddress) => action(CC_RESERVE.REQUEST, {address, contractAddress})
export const fetchMarketMakerData = (contractAddress, mmAddress) => action(FETCH_MARKET_MAKER_DATA.REQUEST, {contractAddress, mmAddress})

export const quote = (fromToken, inAmount, toToken, isBuying) => action(QUOTE.REQUEST, {fromToken, inAmount, toToken, isBuying})
export const invertQuote = (fromToken, inAmount, toToken) => action(INVERT_QUOTE.REQUEST, {fromToken, inAmount, toToken})
export const change = (fromToken, inAmount, toToken, minReturn, isBuying) => action(CHANGE.REQUEST, {fromToken, inAmount, toToken, minReturn, isBuying})
export const slippage = (fromToken, inAmount, outAmount, isBuying) => action(SLIPPAGE.REQUEST, {fromToken, inAmount, outAmount, isBuying})
