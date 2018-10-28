import {FETCH_COMMUNITIES} from 'actions/communities'

const initialState = {
  addresses: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COMMUNITIES.SUCCESS:
      return {...state,
        addresses: [...state.addresses, ...action.response.result],
        hasMore: action.response.metadata.has_more
      }
    default:
      return state
  }
}
