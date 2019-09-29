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
      // return {
      //   ...state,
      //   addresses: union(state.addresses, action.response.result.map((key) => {
      //     return action.response.entities[key].foreignTokenAddress
      //   })),
      //   hasMore: action.response.metadata.has_more
      // }
    // case FETCH_TOKENS.SUCCESS:
    //   return { ...state,
    //     addresses: union(state.addresses, action.response.result),
    //     hasMore: action.response.metadata.has_more }
    // case FETCH_TOKENS_BY_OWNER.SUCCESS:
    //   return { ...state,
    //     addresses: union(action.response.result, state.addresses) }
    default:
      return state
  }
}
