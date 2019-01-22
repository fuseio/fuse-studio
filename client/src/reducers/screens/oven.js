import {FETCH_TOKENS, FETCH_TOKENS_BY_OWNER} from 'actions/token'
import union from 'lodash/union'

const initialState = {
  addresses: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TOKENS.SUCCESS:
      return {...state,
        addresses: union(state.addresses, action.response.result),
        hasMore: action.response.metadata.has_more}
    case FETCH_TOKENS_BY_OWNER.SUCCESS:
      return {...state,
        addresses: union(action.response.result, state.addresses)}
    default:
      return state
  }
}
