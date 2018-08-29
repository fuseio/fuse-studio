import {action, createRequestTypes} from './utils'

export const CREATE_CURRENCY = createRequestTypes('CREATE_CURRENCY')
export const OPEN_MARKET = createRequestTypes('OPEN_MARKET')
export const INSERT_CLN_TO_MARKET_MAKER = createRequestTypes('INSERT_CLN_TO_MARKET_MAKER')

export const createCurrency = (currencyData) => action(CREATE_CURRENCY.REQUEST, {...currencyData})
export const openMarket = (address) => action(OPEN_MARKET.REQUEST, {address})
export const insertCLNtoMarketMaker = (address, clnAmount) => action(INSERT_CLN_TO_MARKET_MAKER.REQUEST, {address, clnAmount})
