import * as actions from 'actions/marketMaker'
import {BALANCE_OF} from 'actions/basicToken'

const initialAccount = {
  balances: {},
  transactions: {
  }
}

const handlers = {
  [actions.CHANGE.PENDING]: (state, action) => {
    const transactionHash = action.response.transactionHash
    const transactions = {...state.transactions,
      [transactionHash]: {
        isPending: true,
        transactionHash
      }}
    return {...state, transactions}
  },
  [actions.CHANGE.SUCCESS]: (state, action) => {
    const receipt = action.response.receipt
    const transactionHash = receipt.transactionHash
    const transactions = {...state.transactions,
      [transactionHash]: {
        isPending: false,
        ...receipt
      }
    }
    return {...state, transactions}
  },
  [actions.CHANGE.FAILURE]: (state, action) => {
    const receipt = action.response.receipt
    const transactionHash = receipt.transactionHash
    const transactions = {...state.transactions,
      [transactionHash]: {
        isPending: false,
        isFailed: true,
        ...receipt
      }
    }
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
