import * as actions from 'actions/marketMaker'

import {filterSuccessActions} from 'utils/actions'

const successActions = filterSuccessActions(actions)

export default (state = {}, action) => {
  switch (action.type) {
    case actions.GET_CURRENT_PRICE.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    case actions.CLN_RESERVE.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    case actions.CC_RESERVE.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    case actions.FETCH_MARKET_MAKER_DATA.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    case actions.CHANGE.PENDING:
      return {...state, ...action.response}
  }
  if (successActions.hasOwnProperty(action.type)) {
    return {...state, ...action.response}
  } else {
    return state
  }
}
