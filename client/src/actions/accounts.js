import {createRequestTypes, action} from './utils'

export const BALANCE_OF = createRequestTypes('BALANCE_OF')
export const BALANCE_OF_CLN = createRequestTypes('BALANCE_OF_CLN')

export const balanceOf = (tokenAddress, accountAddress) => action(BALANCE_OF.REQUEST, {tokenAddress, accountAddress})
export const balanceOfCln = (accountAddress) => action(BALANCE_OF_CLN.REQUEST, {accountAddress})
