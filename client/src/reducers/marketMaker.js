import * as actions from 'actions/marketMaker'

export default (state = {}, action) => {
  switch (action.type) {
    case actions.FETCH_MARKET_MAKER_DATA.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    case actions.OPEN_MARKET.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], isOpenForPublic: true}}
    default:
      return state
  }
}
