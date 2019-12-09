import { FETCH_FEATURED_COMMUNITIES } from 'actions/token'
import union from 'lodash/union'

const initialState = {
  addresses: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FEATURED_COMMUNITIES.SUCCESS:
      return { ...state,
        addresses: union(state.addresses, action.response.result),
        hasMore: action.response.metadata.has_more }
    default:
      return state
  }
}
