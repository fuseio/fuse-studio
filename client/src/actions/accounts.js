import {createRequestTypes, action} from './utils'

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const UPDATE_BALANCES = createRequestTypes('UPDATE_BALANCES')

export const CHANGE = createRequestTypes('CHANGE')
CHANGE.PENDING = 'CHANGE_PENDING'

export const balanceOf = (tokenAddress, accountAddress) => action(BALANCE_OF.REQUEST, {tokenAddress, accountAddress})
export const updateBalances = (accountAddress) => action(UPDATE_BALANCES.REQUEST, {accountAddress})

export const change = (tokenAddress, amount, minReturn, isBuy) => action(CHANGE.REQUEST, {tokenAddress, amount, minReturn, isBuy})
