import {action, createRequestTypes} from './utils'

export const FETCH_TOKEN_QUOTE = createRequestTypes('FETCH_TOKEN_QUOTE')

export const fetchTokenQuote = (symbol, currency) => action(FETCH_TOKEN_QUOTE.REQUEST, {symbol, currency})
