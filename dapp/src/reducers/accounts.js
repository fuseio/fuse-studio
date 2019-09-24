import * as actions from 'actions/accounts'
import { LOGIN, IS_USER_EXISTS } from 'actions/user'
import { FETCH_FEATURED_COMMUNITIES } from 'actions/token'
import { CHECK_ACCOUNT_CHANGED } from 'actions/network'
import pick from 'lodash/pick'

export const initialAccount = {
  balances: {},
  transactions: {},
  tokens: [],
  communities: []
}

const handlers = {
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
  [actions.FETCH_COMMUNITIES.SUCCESS]: (state, action) => {
    return { ...state, communities: action.response.result }
  },
  [FETCH_FEATURED_COMMUNITIES.SUCCESS]: (state, action) => ({
    ...state,
    featuredCommunities: [...action.response.result]
  }),
  [CHECK_ACCOUNT_CHANGED.SUCCESS]: (state, action) => ({ ...state, ...action.response }),
  [actions.SIGN_IN.SUCCESS]: (state, action) => ({ ...state, ...pick(action.response, ['publicData', 'privateData']) }),
  [IS_USER_EXISTS.SUCCESS]: (state, action) => ({ ...state, ...action.response })
}

export default (state = {}, action) => {
  if (handlers.hasOwnProperty(action.type) && action.accountAddress) {
    const account = state[action.accountAddress] || initialAccount
    return { ...state, [action.accountAddress]: handlers[action.type](account, action) }
  }
  return state
}
