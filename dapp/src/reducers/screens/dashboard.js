import { FETCH_TOKEN_STATISTICS, FETCH_TOKEN_PROGRESS } from 'actions/token'
import { ADD_USER, IS_USER_EXISTS } from 'actions/user'

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_TOKEN_STATISTICS.SUCCESS:
      return { ...state, ...action.response }
    case FETCH_TOKEN_PROGRESS.SUCCESS:
      return { ...state, ...action.response }
    case ADD_USER.SUCCESS:
      return { ...state, informationAdded: true }
    case IS_USER_EXISTS.SUCCESS:
      return { ...state, ...action.response }
    default:
      return state
  }
}
