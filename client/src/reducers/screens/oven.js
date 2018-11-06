import {FETCH_COMMUNITIES, FETCH_COMMUNITIES_BY_OWNER} from 'actions/communities'
import union from 'lodash/union'

const initialState = {
  addresses: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COMMUNITIES.SUCCESS:
      return {...state,
        addresses: union(state.addresses, action.response.result),
        hasMore: action.response.metadata.has_more}
    case FETCH_COMMUNITIES_BY_OWNER.SUCCESS:
      return {...state,
        addresses: union(action.response.result, state.addresses)}
    default:
      return state
  }
}
