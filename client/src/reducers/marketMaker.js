import * as actions from 'actions/marketMaker'

import {filterSuccessActions} from 'utils/actions'

const responseActions = filterSuccessActions(actions)
responseActions[actions.CHANGE.PENDING] = actions.CHANGE
responseActions[actions.BUY_QUOTE.REQUEST] = actions.BUY_QUOTE
responseActions[actions.SELL_QUOTE.REQUEST] = actions.SELL_QUOTE
responseActions[actions.INVERT_BUY_QUOTE.REQUEST] = actions.IVERT_BUY_QUOTE
responseActions[actions.INVERT_SELL_QUOTE.REQUEST] = actions.IVERT_SELL_QUOTE

const tokenActions = new Set([
  actions.GET_CURRENT_PRICE.SUCCESS,
  actions.CLN_RESERVE.SUCCESS,
  actions.CC_RESERVE.SUCCESS,
  actions.IS_OPEN_FOR_PUBLIC.SUCCESS,
  actions.FETCH_MARKET_MAKER_DATA.SUCCESS
])

export default (state = {}, action) => {
  if (tokenActions.has(action.type)) {
    return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
  }
  if (responseActions.hasOwnProperty(action.type)) {
    return {...state, ...action.response}
  } else {
    return state
  }
}
