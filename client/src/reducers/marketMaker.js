import * as actions from 'actions/marketMaker'

const tokenActions = new Set([
  actions.FETCH_MARKET_MAKER_DATA.SUCCESS
])

export default (state = {}, action) => {
  if (tokenActions.has(action.type)) {
    return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
  }
  return state
}
