import {FETCH_METADATA} from 'actions/metadata'
import {entityName} from 'actions/communities'
import merge from 'lodash/merge'
import {DEFAULT_COMMUNITY_METADATA_LOGO} from 'constants/uiConstants'

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
    case FETCH_METADATA.FAILURE:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], metadata: {communityLogo: DEFAULT_COMMUNITY_METADATA_LOGO}}}
    default:
      return state
  }
}
