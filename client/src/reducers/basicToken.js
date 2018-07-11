import {FETCH_METADATA} from 'actions/api'

export default (state = {}, action) => {
  if (action.entity === 'basicToken' && action.response) {
    return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
  }
  switch (action.type) {
    case FETCH_METADATA.SUCCESS:
      return {...state, [action.tokenAddress]: {...state[action.tokenAddress], ...action.response}}
    default:
      return state
  }
}
