import * as actions from 'actions/communities'

export default (state = {}, action) => {
  switch (action.type) {
    case actions.FETCH_COMMUNITY_DASHBOARD_STATISTICS.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
