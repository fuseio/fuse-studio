import * as actions from 'actions/accounts'
import { CHANGE } from 'actions/marketMaker'
import { FETCH_TOKEN_LIST } from 'actions/token'
import { LOGIN } from 'actions/user'
import { CHECK_ACCOUNT_CHANGED } from 'actions/network'

export const initialAccount = {
  balances: {},
  transactions: {},
  tokens: [],
  communities: []
}

const handlers = {
  [CHANGE.PENDING]: (state, action) => {
    const transactionHash = action.response.transactionHash
    const transactions = { ...state.transactions,
      [transactionHash]: {
        isPending: true,
        transactionHash
      } }
    return { ...state, transactions }
  },
  [CHANGE.SUCCESS]: (state, action) => {
    const receipt = action.response.receipt
    const transactionHash = receipt.transactionHash
    const transactions = { ...state.transactions,
      [transactionHash]: {
        isPending: false,
        ...receipt
      }
    }
    return { ...state, transactions }
  },
  [CHANGE.FAILURE]: (state, action) => {
    if (!action.response) {
      return state
    }
    const receipt = action.response.receipt
    const transactionHash = receipt.transactionHash
    const transactions = { ...state.transactions,
      [transactionHash]: {
        isPending: false,
        isFailed: true,
        ...receipt
      }
    }
    return { ...state, transactions }
  },
  [actions.BALANCE_OF_TOKEN.SUCCESS]: (state, action) => {
    const balances = { ...state.balances, [action.tokenAddress]: action.response.balanceOf }
    return { ...state, balances }
  },
  [actions.BALANCE_OF_NATIVE.SUCCESS]: (state, action) => {
    return { ...state, ...action.response }
  },
  [LOGIN.SUCCESS]: (state, action) => {
    return { ...state, ...action.response }
  },
  [FETCH_TOKEN_LIST.SUCCESS]: (state, action) => {
    return { ...state, tokens: action.response.result }
  },
  [actions.FETCH_COMMUNITIES.SUCCESS]: (state, action) => {
    return { ...state, communities: action.response.result }
  },
  [CHECK_ACCOUNT_CHANGED.SUCCESS]: (state, action) => ({ ...state, ...action.response })
}

export default (state = {}, action) => {
  if (handlers.hasOwnProperty(action.type) && action.accountAddress) {
    const account = state[action.accountAddress] || initialAccount
    return { ...state, [action.accountAddress]: handlers[action.type](account, action) }
  }
  return state
}
