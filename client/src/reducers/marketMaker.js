import * as actions from 'actions/marketMaker'

import {filterSuccessActions} from 'utils/actions'

const successActions = filterSuccessActions(actions)
successActions[actions.CHANGE.PENDING] = actions.CHANGE

const tokenActions = new Set(
  actions.GET_CURRENT_PRICE.SUCCESS,
  actions.CLN_RESERVE.SUCCESS,
  actions.CC_RESERVE.SUCCESS,
  actions.IS_OPEN_FOR_PUBLIC.SUCCESS,
  actions.FETCH_MARKET_MAKER_DATA.SUCCESS
)

export default (state = {}, action) => {
  if (tokenActions.has(action.type)) {
    return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
  }
  if (successActions.hasOwnProperty(action.type)) {
    return {...state, ...action.response}
  } else {
    return state
  }
}
