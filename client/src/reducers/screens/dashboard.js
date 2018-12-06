import {FETCH_COMMUNITY_STATISTICS} from 'actions/communities'

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_COMMUNITY_STATISTICS.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
