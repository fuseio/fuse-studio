import * as actions from 'actions/fiat'

export default (state = {}, action) => {
  switch (action.type) {
    case actions.FETCH_TOKEN_QUOTE.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
