import * as actions from 'actions/marketMaker'
import {BALANCE_OF} from 'actions/basicToken'

const initialAccount = {
  balances: {},
  transactions: {
    pending: [],
    confirmed: []
  }
}

const handlers = {
  [actions.CHANGE.PENDING]: (state, action) => {
    const account = state[action.accountAddress] || initialAccount
    const pending = [...account.transactions.pending, action.response.transactionHash]
    const transactions = {...account.transactions, pending}
    return {...state, transactions}
  },
  [actions.CHANGE.SUCCESS]: (state, action) => {
    const receipt = action.response.receipt
    const account = state[action.accountAddress] || initialAccount
    const pending = account.transactions.pending.filter(transaction => transaction !== receipt.transactionHash)
    const confirmed = [...account.transactions.confirmed, receipt]
    const transactions = {...account.transactions, confirmed, pending}
    return {...state, transactions}
  },
  [actions.CHANGE.FAILURE]: (state, action) => {
    const receipt = action.response.receipt
    const account = state[action.accountAddress] || initialAccount
    const pending = account.transactions.pending.filter(transaction => transaction !== receipt.transactionHash)
    const transactions = {...account.transactions, pending}
    return {...state, transactions}
  }
  // [BALANCE_OF.SUCCESS]: (state, action) => {
  //   const balances = {...state.balances, [action.contractAddress]: action.response.balanceOf}
  //   return {...state, balances}
  // }
}

export default (state = {}, action) => {
  if (handlers.hasOwnProperty(action.type)) {
    const account = state[action.accountAddress] || initialAccount
    return {...state, [action.accountAddress]: handlers[action.type](account, action)}
  }
  return state
}
