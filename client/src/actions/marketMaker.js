import {action, createRequestTypes} from './utils'

export const GET_CURRENT_PRICE = createRequestTypes('GET_CURRENT_PRICE')
export const CLN_RESERVE = createRequestTypes('CLN_RESERVE')
export const CC_RESERVE = createRequestTypes('CC_RESERVE')

export const FETCH_MARKET_MAKER_DATA = createRequestTypes('FETCH_MARKET_MAKER_DATA')

export const QUOTE = createRequestTypes('QUOTE')
export const INVERT_QUOTE = createRequestTypes('INVERT_QUOTE')
export const CHANGE = createRequestTypes('CHANGE')

export const BUY_QUOTE = createRequestTypes('BUY_QUOTE')
export const SELL_QUOTE = createRequestTypes('SELL_QUOTE')

export const INVERT_BUY_QUOTE = createRequestTypes('INVERT_BUY_QUOTE')
export const INVERT_SELL_QUOTE = createRequestTypes('INVERT_SELL_QUOTE')

export const BUY_CC = createRequestTypes('BUY_CC')
export const SELL_CC = createRequestTypes('SELL_CC')

export const SLIPPAGE = createRequestTypes('SLIPPAGE')

export const getCurrentPrice = (address, contractAddress) => action(GET_CURRENT_PRICE.REQUEST, {address, contractAddress})
export const clnReserve = (address, contractAddress) => action(CLN_RESERVE.REQUEST, {address, contractAddress})
export const ccReserve = (address, contractAddress) => action(CC_RESERVE.REQUEST, {address, contractAddress})
export const fetchMarketMakerData = (contractAddress, mmAddress) => action(FETCH_MARKET_MAKER_DATA.REQUEST, {contractAddress, mmAddress})

export const quote = (fromToken, inAmount, toToken, isBuying) => action(QUOTE.REQUEST, {fromToken, inAmount, toToken, isBuying})
export const invertQuote = (fromToken, inAmount, toToken) => action(INVERT_QUOTE.REQUEST, {fromToken, inAmount, toToken})
export const change = (tokenAddress, amount, minReturn, isBuying) => action(CHANGE.REQUEST, {tokenAddress, amount, minReturn, isBuying})
export const slippage = (fromToken, inAmount, outAmount, isBuying) => action(SLIPPAGE.REQUEST, {fromToken, inAmount, outAmount, isBuying})

export const buyQuote = (tokenAddress, clnAmount) => action(BUY_QUOTE.REQUEST, {tokenAddress, clnAmount})
export const sellQuote = (tokenAddress, ccAmount) => action(SELL_QUOTE.REQUEST, {tokenAddress, ccAmount})

export const invertBuyQuote = (tokenAddress, ccAmount) => action(INVERT_BUY_QUOTE.REQUEST, {tokenAddress, ccAmount})
export const invertSellQuote = (tokenAddress, clnAmount) => action(INVERT_SELL_QUOTE.REQUEST, {tokenAddress, clnAmount})

export const buyCc = (tokenAddress, amount, minReturn) => action(BUY_CC.REQUEST, {tokenAddress, amount, minReturn})
export const sellCc = (tokenAddress, amount, minReturn) => action(SELL_CC.REQUEST, {tokenAddress, amount, minReturn})

// export const sellQuote = (tokenAddress, amount, minReturn) => action(SELL_CC.REQUEST, {tokenAddress, amount, minReturn})
