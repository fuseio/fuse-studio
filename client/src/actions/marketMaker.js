import {action, createRequestTypes} from './utils'

export const quoteAction = (type, payload) => ({
  ...action(type, payload),
  response: {
    isFetching: true
  }
})

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

export const PREDICT_CLN_PRICES = createRequestTypes('PREDICT_CLN_PRICES')

export const quoteActions = [CHANGE, BUY_QUOTE, SELL_QUOTE, INVERT_BUY_QUOTE, INVERT_SELL_QUOTE, ESTIMATE_GAS_BUY_CC, ESTIMATE_GAS_SELL_CC]

export const fetchMarketMakerData = (tokenAddress, mmAddress, blockNumber) => action(FETCH_MARKET_MAKER_DATA.REQUEST, {tokenAddress, mmAddress, blockNumber})

export const quote = (fromToken, inAmount, toToken, isBuy) => action(QUOTE.REQUEST, {fromToken, inAmount, toToken, isBuy})
export const invertQuote = (fromToken, inAmount, toToken) => action(INVERT_QUOTE.REQUEST, {fromToken, inAmount, toToken})
export const change = (tokenAddress, amount, minReturn, isBuy) => action(CHANGE.REQUEST, {tokenAddress, amount, minReturn, isBuy})

export const buyQuote = (tokenAddress, clnAmount) => quoteAction(BUY_QUOTE.REQUEST, {tokenAddress, clnAmount})
export const sellQuote = (tokenAddress, ccAmount) => quoteAction(SELL_QUOTE.REQUEST, {tokenAddress, ccAmount})

export const invertBuyQuote = (tokenAddress, ccAmount) => quoteAction(INVERT_BUY_QUOTE.REQUEST, {tokenAddress, ccAmount})
export const invertSellQuote = (tokenAddress, clnAmount) => quoteAction(INVERT_SELL_QUOTE.REQUEST, {tokenAddress, clnAmount})

export const buyCc = (tokenAddress, amount, minReturn, options) => action(BUY_CC.REQUEST, {tokenAddress, amount, minReturn, options})
export const sellCc = (tokenAddress, amount, minReturn, options) => action(SELL_CC.REQUEST, {tokenAddress, amount, minReturn, options})

export const estimateGasBuyCc = (tokenAddress, amount, minReturn) => action(ESTIMATE_GAS_BUY_CC.REQUEST, {tokenAddress, amount, minReturn})
export const estimateGasSellCc = (tokenAddress, amount, minReturn) => action(ESTIMATE_GAS_SELL_CC.REQUEST, {tokenAddress, amount, minReturn})

export const predictClnPrices = (tokenAddress, {initialClnReserve,
  amountOfTransactions, averageTransactionInUsd, gainRatio}) => action(PREDICT_CLN_PRICES.REQUEST,
  {tokenAddress, initialClnReserve, amountOfTransactions, averageTransactionInUsd, gainRatio})
