// import * as marketMaker from 'actions/marketMaker'
// import {QUOTE, INVERT_QUOTE} from 'actions/marketMaker'
import * as actions from 'actions/marketMaker'

const initialState = {
  quotePairs: []
}

export default (state = initialState, action) => {
  // if (actions.hasOwnProperty(action.type)) {
  //   return {...state, ...action.response}
  // } else {
  //   return state
  // }
  switch (action.type) {
    case actions.QUOTE.SUCCESS:
      return {...state, ...action.response}
    case actions.INVERT_QUOTE.SUCCESS:
      return {...state, ...action.response}
    case actions.INVERT_BUY_QUOTE.SUCCESS:
      return {...state, ...action.response}
    case actions.INVERT_SELL_QUOTE.SUCCESS:
      return {...state, ...action.response}
    case actions.BUY_QUOTE.SUCCESS:
      return {...state, ...action.response}
    case actions.SELL_QUOTE.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
