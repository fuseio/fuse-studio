import {action, createTransactionRequestTypes} from './utils'

export const CREATE_CURRENCY = createTransactionRequestTypes('CREATE_CURRENCY')
export const INSERT_CLN_TO_MARKET_MAKER = createTransactionRequestTypes('INSERT_CLN_TO_MARKET_MAKER')

export const createCurrency = (currencyData) => action(CREATE_CURRENCY.REQUEST, {...currencyData})
export const insertCLNtoMarketMaker = (address, clnAmount) => action(INSERT_CLN_TO_MARKET_MAKER.REQUEST, {address, clnAmount})
