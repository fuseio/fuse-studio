import {FETCH_TOKEN_STATISTICS} from 'actions/token'

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_TOKEN_STATISTICS.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
