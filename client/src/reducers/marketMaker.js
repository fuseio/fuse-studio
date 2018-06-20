// import * as marketMaker from 'actions/marketMaker'
import {QUOTE} from 'actions/marketMaker'

export default (state = {}, action) => {
  // if (action.entity === 'basicToken') {
  //   return {...state, [action.contractAddress]: {...state[action.contractAddress], ...action.response}}
  // }
  switch (action.type) {
    case QUOTE.SUCCESS:
      return {...state, [action.address]: {...state[action.address], ...action.response}}
    default:
      return state
  }
}
