// import * as marketMaker from 'actions/marketMaker'
import {QUOTE, INVERT_QUOTE} from 'actions/marketMaker'

const initialState = {
  quotePairs: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case QUOTE.SUCCESS:
      return {...state, ...action.response}
    case INVERT_QUOTE.SUCCESS:
      return {...state, ...action.response}
    default:
      return state
  }
}
