import {FETCH_METADATA} from 'actions/api'

export default (state = {}, action) => {
  if (action.entity === 'basicToken') {
    return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
  }
  switch (action.type) {
    case FETCH_METADATA.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    default:
      return state
  }
}
