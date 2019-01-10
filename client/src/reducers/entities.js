import merge from 'lodash/merge'

const initialState = {
  metadata: {},
  communities: {}
}

export default (state = initialState, action) => {
  if (action.entity && action.response) {
    if (action.response.entities) {
      return merge({}, state, {[action.entity]: action.response.entities})
    }
    const obj = {
      [action.tokenAddress]: action.response
    }
    return merge({}, state, {[action.entity]: obj})
  }
  return state
}
