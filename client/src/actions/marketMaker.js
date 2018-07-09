import {action, createRequestTypes} from './utils'

export const GET_CURRENT_PRICE = createRequestTypes('GET_CURRENT_PRICE')
export const CLN_RESERVE = createRequestTypes('CLN_RESERVE')
export const CC_RESERVE = createRequestTypes('CC_RESERVE')

export const FETCH_MARKET_MAKER_DATA = createRequestTypes('FETCH_MARKET_MAKER_DATA')

export const QUOTE = createRequestTypes('QUOTE')
export const INVERT_QUOTE = createRequestTypes('INVERT_QUOTE')
export const CHANGE = createRequestTypes('CHANGE')
CHANGE.PENDING = 'CHANGE_PENDING'

export const BUY_QUOTE = createRequestTypes('BUY_QUOTE')
export const SELL_QUOTE = createRequestTypes('SELL_QUOTE')

export const INVERT_BUY_QUOTE = createRequestTypes('INVERT_BUY_QUOTE')
export const INVERT_SELL_QUOTE = createRequestTypes('INVERT_SELL_QUOTE')

export const BUY_CC = createRequestTypes('BUY_CC')
export const SELL_CC = createRequestTypes('SELL_CC')

export const ESTIMATE_GAS_BUY_CC = createRequestTypes('ESTIMATE_GAS_BUY_CC')
export const ESTIMATE_GAS_SELL_CC = createRequestTypes('ESTIMATE_GAS_SELL_CC')

export const getCurrentPrice = (address, tokenAddress) => action(GET_CURRENT_PRICE.REQUEST, {address, tokenAddress})
export const clnReserve = (address, tokenAddress) => action(CLN_RESERVE.REQUEST, {address, tokenAddress})
export const ccReserve = (address, tokenAddress) => action(CC_RESERVE.REQUEST, {address, tokenAddress})
export const fetchMarketMakerData = (tokenAddress, mmAddress) => action(FETCH_MARKET_MAKER_DATA.REQUEST, {tokenAddress, mmAddress})

export const quote = (fromToken, inAmount, toToken, isBuying) => action(QUOTE.REQUEST, {fromToken, inAmount, toToken, isBuying})
export const invertQuote = (fromToken, inAmount, toToken) => action(INVERT_QUOTE.REQUEST, {fromToken, inAmount, toToken})
export const change = (tokenAddress, amount, minReturn, isBuying) => action(CHANGE.REQUEST, {tokenAddress, amount, minReturn, isBuying})

export const buyQuote = (tokenAddress, clnAmount) => action(BUY_QUOTE.REQUEST, {tokenAddress, clnAmount})
export const sellQuote = (tokenAddress, ccAmount) => action(SELL_QUOTE.REQUEST, {tokenAddress, ccAmount})

export const invertBuyQuote = (tokenAddress, ccAmount) => action(INVERT_BUY_QUOTE.REQUEST, {tokenAddress, ccAmount})
export const invertSellQuote = (tokenAddress, clnAmount) => action(INVERT_SELL_QUOTE.REQUEST, {tokenAddress, clnAmount})

export const buyCc = (tokenAddress, amount, minReturn, options) => action(BUY_CC.REQUEST, {tokenAddress, amount, minReturn, options})
export const sellCc = (tokenAddress, amount, minReturn, options) => action(SELL_CC.REQUEST, {tokenAddress, amount, minReturn, options})

export const estimateGasBuyCc = (tokenAddress, amount, minReturn) => action(ESTIMATE_GAS_BUY_CC.REQUEST, {tokenAddress, amount, minReturn})
export const estimateGasSellCc = (tokenAddress, amount, minReturn) => action(ESTIMATE_GAS_SELL_CC.REQUEST, {tokenAddress, amount, minReturn})
