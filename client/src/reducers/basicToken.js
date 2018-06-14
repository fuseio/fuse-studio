import * as marketMaker from 'actions/marketMaker'
import {FETCH_METADATA} from 'actions/api'

export default (state = {}, action) => {
  if (action.entity === 'basicToken') {
    return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
  }
  switch (action.type) {
    case marketMaker.GET_CURRENT_PRICE.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case marketMaker.CLN_RESERVE.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}, finishedMostCalls: true}
    case marketMaker.CC_RESERVE.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    case FETCH_METADATA.SUCCESS:
      return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
    default:
      return state
  }
}
