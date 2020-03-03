import * as actions from 'actions/accounts'
import { LOGIN, IS_USER_EXISTS } from 'actions/user'
import { FETCH_FEATURED_COMMUNITIES } from 'actions/token'
import { CHECK_ACCOUNT_CHANGED, CONNECT_TO_WALLET } from 'actions/network'
import pick from 'lodash/pick'
import union from 'lodash/union'

export const initialAccount = {
  balances: {},
  transactions: {},
  tokens: [],
  communities: [],
  postponed: []
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
  [CHECK_ACCOUNT_CHANGED.SUCCESS]: (state, action) => ({ ...state, ...action.response }),
  [actions.SIGN_IN.SUCCESS]: (state, action) => ({ ...state, ...pick(action.response, ['publicData', 'privateData']) }),
  [IS_USER_EXISTS.SUCCESS]: (state, action) => ({ ...state, ...action.response }),
  [CONNECT_TO_WALLET.SUCCESS]: (state, action) => ({ ...state, providerInfo: { ...action.response.providerInfo } }),
  [actions.POSTPONE_ACTION.SUCCESS]: (state, action) => ({ ...state, postponed: [...state, action.postponed] }),
  [actions.EXECUTE_POSTPONED_ACTION]: (state, action) => ({ ...state, postponed: state.postponed.filter(postponedAction => postponedAction !== action.postponed) })
}

export default (state = {}, action) => {
  if (handlers.hasOwnProperty(action.type) && action.accountAddress) {
    const account = state[action.accountAddress] || initialAccount
    return { ...state, [action.accountAddress]: handlers[action.type](account, action) }
  }

  if (action.type === FETCH_FEATURED_COMMUNITIES.SUCCESS) {
    return { ...state, featuredCommunities: union(state.featuredCommunities, action.response.result) }
  }

  if (action.type === actions.GET_INITIAL_ADDRESS.SUCCESS) {
    return { ...state, ...actions.response }
  }

  return state
}
