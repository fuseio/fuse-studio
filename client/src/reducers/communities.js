import {FETCH_METADATA} from 'actions/metadata'
import {entityName} from 'actions/communities'
import merge from 'lodash/merge'

export default (state = {}, action) => {
  if (action.entity === entityName && action.response) {
    if (action.response.entities) {
      return merge({}, state, action.response.entities)
    }
    const obj = {
      [action.tokenAddress]: action.response
    }
    return merge({}, state, obj)
  }
  switch (action.type) {
    case FETCH_METADATA.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    default:
      return state
  }
}
