import {action, createRequestTypes} from './index'

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const NAME = createRequestTypes('NAME')
export const TRANSFER = createRequestTypes('TRANSFER')

export const balanceOf = (address) => action(BALANCE_OF.REQUEST, {address})
export const name = () => action(NAME.REQUEST)
export const transfer = (to, value) => action(TRANSFER.REQUEST, {to, value})
